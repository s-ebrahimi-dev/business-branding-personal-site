
import mongoose from 'mongoose';
import Content from '../models/Content.js';

const CONTENT_TYPES = ['article', 'note', 'podcast'];
const CONTENT_STATUSES = ['draft', 'published'];

export async function createContent(req, res, next) {
  try {
    const { type, slug, content, coverImage, podcast } = req.body;

    // Validate required fields.
    if (
      typeof type !== 'string' ||
      !CONTENT_TYPES.includes(type) ||
      typeof slug !== 'string' ||
      !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid content type and slug are required.',
      });
    }

    // Validate the slug format before reaching MongoDB.
    const normalizedSlug = slug.trim().toLowerCase();
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (
      normalizedSlug.length > 160 ||
      !slugPattern.test(normalizedSlug)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Slug must contain lowercase letters, numbers, and single hyphens.',
      });
    }

    // Require the language content to be an object when provided.
    if (
      content !== undefined &&
      (!content || typeof content !== 'object' || Array.isArray(content))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Content must be an object containing language versions.',
      });
    }

    // Build the document from explicitly allowed fields.
    const documentData = {
      type,
      slug: normalizedSlug,
      content: {},
    };

    for (const language of ['en', 'fa']) {
      const translation = content?.[language];

      if (translation === undefined) {
        continue;
      }

      if (
        !translation ||
        typeof translation !== 'object' ||
        Array.isArray(translation)
      ) {
        return res.status(400).json({
          success: false,
          message: `The ${language} translation must be an object.`,
        });
      }

      if (
        translation.status !== undefined &&
        !CONTENT_STATUSES.includes(translation.status)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid status for the ${language} translation.`,
        });
      }

      const title = translation.title ?? '';
      const summary = translation.summary ?? '';
      const body = translation.body ?? '';

      if (
        typeof title !== 'string' ||
        typeof summary !== 'string' ||
        typeof body !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message: `Title, summary, and body for ${language} must be strings.`,
        });
      }

      documentData.content[language] = {
        title,
        summary,
        body,
        status: translation.status ?? 'draft',
      };

      // Only published translations receive a publication date.
      if (translation.status === 'published') {
        documentData.content[language].publishedAt = new Date();
      }
    }

    if (coverImage !== undefined) {
      if (typeof coverImage !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Cover image must be a string.',
        });
      }

      documentData.coverImage = coverImage;
    }

    if (type === 'podcast' && podcast !== undefined) {
      if (
        !podcast ||
        typeof podcast !== 'object' ||
        Array.isArray(podcast)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Podcast details must be an object.',
        });
      }

      const { audioUrl, durationSeconds } = podcast;

      if (
        audioUrl !== undefined &&
        typeof audioUrl !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Audio URL must be a string.',
        });
      }

      if (
        durationSeconds !== undefined &&
        durationSeconds !== null &&
        (!Number.isFinite(durationSeconds) || durationSeconds < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a non-negative number.',
        });
      }

      documentData.podcast = {
        audioUrl: audioUrl ?? '',
        durationSeconds: durationSeconds ?? null,
      };
    }

    const createdContent = await Content.create(documentData);

    return res.status(201).json({
      success: true,
      message: 'Content created successfully.',
      data: createdContent,
    });
  } catch (error) {
    // MongoDB unique-index violation: duplicate slug.
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(409).json({
        success: false,
        message: 'A content item with this slug already exists.',
      });
    }

    return next(error);
  }
}


export async function getContent(req, res, next) {
  try {
    const { type, lang = 'en', status } = req.query;

    // 1. Validate the content type.
    if (
      type !== undefined &&
      (typeof type !== 'string' || !CONTENT_TYPES.includes(type))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type.',
      });
    }

    // 2. Validate the requested language.
    if (typeof lang !== 'string' || !['en', 'fa'].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language.',
      });
    }

    // 3. Identify the user's authorization level.
    const isAdmin = req.user?.role === 'admin';

    // 4. Validate pagination.
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters.',
      });
    }

    // 5. Build the MongoDB filter.
    const filter = {
      [`content.${lang}`]: { $exists: true },
    };

    if (type) {
      filter.type = type;
    }

    if (isAdmin) {
      if (status !== undefined) {
        if (
          typeof status !== 'string' ||
          !CONTENT_STATUSES.includes(status)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid content status.',
          });
        }

        filter[`content.${lang}.status`] = status;
      }
    } else {
      // Public visitors can only retrieve published content.
      filter[`content.${lang}.status`] = 'published';
    }

    // 6. Prepare the database query.
    const skip = (page - 1) * limit;

    let query = Content.find(filter);

    // Public responses contain only the requested language.
    if (!isAdmin) {
      query = query.select({
        type: 1,
        slug: 1,
        [`content.${lang}`]: 1,
        coverImage: 1,
        createdAt: 1,
        updatedAt: 1,
      });
    }

    const sort = isAdmin
      ? { updatedAt: -1 }
      : {
          [`content.${lang}.publishedAt`]: -1,
          createdAt: -1,
        };

    // 7. Retrieve the page and total count.
    const [items, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).lean(),
      Content.countDocuments(filter),
    ]);

    // 8. Return the results.
    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}


export async function getContentBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { lang = 'en' } = req.query;

    // 1. Validate the requested language.
    if (typeof lang !== 'string' || !['en', 'fa'].includes(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language.',
      });
    }

    // 2. Identify the user's authorization level.
    const isAdmin = req.user?.role === 'admin';

    // 3. Find the content by slug.
    const filter = {
      slug,
      [`content.${lang}`]: { $exists: true },
    };

    // 4. Public visitors can only access published content.
    if (!isAdmin) {
      filter[`content.${lang}.status`] = 'published';
    }

    // 5. Retrieve the matching document.
    let query = Content.findOne(filter);

    // Public visitors only need the requested language.
    if (!isAdmin) {
      query = query.select({
        type: 1,
        slug: 1,
        [`content.${lang}`]: 1,
        coverImage: 1,
        podcast: 1,
        createdAt: 1,
        updatedAt: 1,
      });
    }

    const item = await query.lean();

    // 6. Handle content that doesn't exist or isn't accessible.
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Content not found.',
      });
    }

    // 7. Return the single content document.
    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}


export async function updateContent(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Validate the MongoDB document ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID.',
      });
    }

    // 2. Ensure the request body is a plain object.
    if (
      !updates ||
      typeof updates !== 'object' ||
      Array.isArray(updates) ||
      Object.getPrototypeOf(updates) !== Object.prototype
    ) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a JSON object.',
      });
    }

    // 3. Reject fields that this controller does not allow.
    const allowedFields = ['slug', 'content', 'coverImage', 'podcast'];
    const unknownFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported update fields.',
        fields: unknownFields,
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update.',
      });
    }

    // 4. Find the existing document.
    const item = await Content.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Content not found.',
      });
    }

    // 5. Update the slug if provided.
    if (Object.hasOwn(updates, 'slug')) {
      if (
        typeof updates.slug !== 'string' ||
        updates.slug.trim().length === 0 ||
        updates.slug.trim().length > 160 ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updates.slug.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid slug.',
        });
      }

      item.slug = updates.slug.trim();
    }

    // 6. Update the cover image if provided.
    if (Object.hasOwn(updates, 'coverImage')) {
      if (
        typeof updates.coverImage !== 'string' ||
        updates.coverImage.length > 2048
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cover image value.',
        });
      }

      item.coverImage = updates.coverImage.trim();
    }

    // 7. Update translations independently.
    if (Object.hasOwn(updates, 'content')) {
      const translations = updates.content;

      if (
        !translations ||
        typeof translations !== 'object' ||
        Array.isArray(translations) ||
        Object.getPrototypeOf(translations) !== Object.prototype
      ) {
        return res.status(400).json({
          success: false,
          message: 'Content translations must be an object.',
        });
      }

      const languages = Object.keys(translations);

      if (
        languages.length === 0 ||
        languages.some((lang) => !['en', 'fa'].includes(lang))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Only English and Persian translations are supported.',
        });
      }

      const allowedTranslationFields = [
        'title',
        'summary',
        'body',
        'status',
      ];

      for (const lang of languages) {
        const translation = translations[lang];

        if (
          !translation ||
          typeof translation !== 'object' ||
          Array.isArray(translation) ||
          Object.getPrototypeOf(translation) !== Object.prototype
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${lang} translation.`,
          });
        }

        const fields = Object.keys(translation);

        if (
          fields.length === 0 ||
          fields.some(
            (field) => !allowedTranslationFields.includes(field)
          )
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid fields in ${lang} translation.`,
          });
        }

        // Validate all supplied values before modifying the document.
        for (const [field, value] of Object.entries(translation)) {
          if (field === 'title') {
            if (
              typeof value !== 'string' ||
              value.trim().length > 200
            ) {
              return res.status(400).json({
                success: false,
                message: `Invalid ${lang} title.`,
              });
            }
          }

          if (field === 'summary') {
            if (
              typeof value !== 'string' ||
              value.trim().length > 500
            ) {
              return res.status(400).json({
                success: false,
                message: `Invalid ${lang} summary.`,
              });
            }
          }

          if (field === 'body' && typeof value !== 'string') {
            return res.status(400).json({
              success: false,
              message: `Invalid ${lang} body.`,
            });
          }

          if (
            field === 'status' &&
            !CONTENT_STATUSES.includes(value)
          ) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${lang} publication status.`,
            });
          }
        }
      }

      // Apply the validated translation updates.
      for (const lang of languages) {
        const translation = translations[lang];
        const previousStatus =
          item.get(`content.${lang}.status`) ?? 'draft';
        const previousPublishedAt =
          item.get(`content.${lang}.publishedAt`) ?? null;

        for (const [field, value] of Object.entries(translation)) {
          if (field === 'status') continue;

          item.set(
            `content.${lang}.${field}`,
            field === 'title' || field === 'summary'
              ? value.trim()
              : value
          );
        }

        if (Object.hasOwn(translation, 'status')) {
          const newStatus = translation.status;

          item.set(`content.${lang}.status`, newStatus);

          if (newStatus === 'draft') {
            item.set(`content.${lang}.publishedAt`, null);
          } else if (
            previousStatus !== 'published' ||
            !previousPublishedAt
          ) {
            item.set(`content.${lang}.publishedAt`, new Date());
          }
        }
      }
    }

    // 8. Update podcast metadata only for podcasts.
    if (Object.hasOwn(updates, 'podcast')) {
      if (item.type !== 'podcast') {
        return res.status(400).json({
          success: false,
          message: 'Podcast metadata can only be updated for podcasts.',
        });
      }

      const podcast = updates.podcast;

      if (
        !podcast ||
        typeof podcast !== 'object' ||
        Array.isArray(podcast) ||
        Object.getPrototypeOf(podcast) !== Object.prototype
      ) {
        return res.status(400).json({
          success: false,
          message: 'Podcast metadata must be an object.',
        });
      }

      const allowedPodcastFields = ['audioUrl', 'durationSeconds'];
      const podcastFields = Object.keys(podcast);

      if (
        podcastFields.length === 0 ||
        podcastFields.some(
          (field) => !allowedPodcastFields.includes(field)
        )
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid podcast metadata fields.',
        });
      }

      if (Object.hasOwn(podcast, 'audioUrl')) {
        if (typeof podcast.audioUrl !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Invalid podcast audio URL.',
          });
        }

        item.set('podcast.audioUrl', podcast.audioUrl.trim());
      }

      if (Object.hasOwn(podcast, 'durationSeconds')) {
        if (
          podcast.durationSeconds !== null &&
          (!Number.isInteger(podcast.durationSeconds) ||
            podcast.durationSeconds < 0)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Podcast duration must be a non-negative integer or null.',
          });
        }

        item.set('podcast.durationSeconds', podcast.durationSeconds);
      }
    }

    // 9. Save and return the updated document.
    const updatedItem = await item.save();

    return res.status(200).json({
      success: true,
      message: 'Content updated successfully.',
      data: updatedItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A content item with this slug already exists.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Content validation failed.',
      });
    }

    return next(error);
  }
}
