// Copy-clipboard bền vững: ưu tiên Clipboard API, fallback execCommand cho HTTP/LAN.
// Cùng pattern với views/forms/dns/TACConfigPanel.js — tách riêng để 2 file trong
// folder contribution/ (ContributionForm.jsx, ContributionWizard.jsx) dùng chung,
// tránh duplicate lần thứ 3 trong codebase.
export async function copyToClipboard(text) {
  try {
    const normalized = String(text ?? "");
    if (!normalized) return false;

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(normalized);
      return true;
    }

    const ta = document.createElement("textarea");
    ta.value = normalized;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.left = "-1000px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    console.error("copyToClipboard error:", e);
    return false;
  }
}
