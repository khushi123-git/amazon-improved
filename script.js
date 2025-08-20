// ✅ Supabase Client
const SUPABASE_URL = "https://purnzijebomdwovbfdfm.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_EY"; // paste your anon public key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Floating Support Logic
document.addEventListener("DOMContentLoaded", () => {
  const supportBtn = document.getElementById("supportBtn");
  const supportOverlay = document.getElementById("supportOverlay");
  const closeBtn = document.getElementById("closeSupport");
  const form = document.getElementById("supportForm");

  supportBtn.addEventListener("click", () => {
    supportOverlay.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    supportOverlay.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const query = document.getElementById("query").value.trim();

    let { error } = await supabaseClient
      .from("support_queries")
      .insert([{ name, query }]);

    if (error) {
      document.getElementById("supportMsg").innerText = "❌ " + error.message;
    } else {
      document.getElementById("supportMsg").innerText = "✅ Query submitted!";
      form.reset();
    }
  });
});
