import "./input.css";

const navItems = document.querySelectorAll("[data-page]");
const sections = document.querySelectorAll("[data-section]");
const title = document.querySelector("#page-title");
const description = document.querySelector("#page-description");
const toast = document.querySelector("#toast");

const pages = {
 dashboard:["پیشخوان","نمای کلی محتوای وب‌سایت"],articles:["مقالات و یادداشت‌ها","ایجاد، ویرایش و مدیریت مقالات"],
 videos:["ویدئوها و سخنرانی‌ها","مدیریت محتوای تصویری و آموزشی"],podcasts:["پادکست‌ها","مدیریت محتوای صوتی"],
 courses:["دوره‌ها و کارگاه‌ها","مدیریت برنامه‌های آموزشی"],books:["کتاب‌ها و آثار علمی","مدیریت آثار علمی و انتشارات"],
 profile:["پروفایل حرفه‌ای","مدیریت اطلاعات و هویت حرفه‌ای"],media:["کتابخانه رسانه","مدیریت فایل‌ها و تصاویر"],
 "article-form":["ویرایشگر مقاله","ثبت و ویرایش محتوای نوشتاری"],"video-form":["ثبت ویدئو","ثبت مشخصات ویدئو و تصویر جلد"],
 "podcast-form":["ثبت پادکست","ثبت مشخصات قسمت صوتی"],"course-form":["ثبت دوره یا کارگاه","معرفی برنامه آموزشی"],"book-form":["ثبت کتاب یا اثر علمی","ثبت مشخصات اثر"]
};

function showPage(name) {
 const page = pages[name];
 if (!page) return;
 sections.forEach(section => section.classList.toggle("hidden", section.dataset.section !== name));
 navItems.forEach(item => item.classList.toggle("is-active", item.dataset.page === name));
 title.textContent = page[0];
 description.textContent = page[1];
 window.scrollTo({top:0,behavior:"smooth"});
}
navItems.forEach(item => item.addEventListener("click", () => showPage(item.dataset.page)));

function showToast(message) {
 toast.textContent = message;
 toast.classList.remove("hidden");
 clearTimeout(showToast.timer);
 showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3500);
}

const search = document.querySelector("#content-search");
const status = document.querySelector("#content-status");
const rows = document.querySelectorAll("#article-table tr");
function filterArticles() {
 const term = search.value.trim().toLocaleLowerCase("fa");
 rows.forEach(row => {
  const matchText = row.cells[0].textContent.toLocaleLowerCase("fa").includes(term);
  const matchStatus = status.value === "all" || row.dataset.status === status.value;
  row.classList.toggle("hidden", !(matchText && matchStatus));
 });
}
search?.addEventListener("input", filterArticles);
status?.addEventListener("change", filterArticles);

document.querySelectorAll("[data-demo-form]").forEach(form => form.addEventListener("submit", event => {
 event.preventDefault();
 showToast("این نسخه نمایشی است؛ ذخیره‌سازی واقعی پس از اتصال بک‌اند فعال می‌شود.");
}));

const upload = document.querySelector("#media-upload");
const preview = document.querySelector("#media-preview");
upload?.addEventListener("change", () => {
 [...(upload.files || [])].forEach(file => {
  const item = document.createElement("div");
  item.className = "media-library-item";
  const icon = document.createElement("span");
  icon.textContent = file.type.startsWith("image/") ? "▧" : file.type.startsWith("audio/") ? "♫" : "▷";
  const info = document.createElement("div");
  const name = document.createElement("p");
  name.className = "break-all font-semibold";
  name.textContent = file.name;
  const size = document.createElement("p");
  size.className = "mt-1 text-xs text-[#827875]";
  size.textContent = `${(file.size / 1048576).toFixed(2)} مگابایت · پیش‌نمایش محلی`;
  info.append(name,size); item.append(icon,info); preview.prepend(item);
 });
 if (upload.files.length) showToast("فایل‌ها فقط در این صفحه نمایش داده شدند و بارگذاری نشده‌اند.");
 upload.value = "";
});
showPage("dashboard");
