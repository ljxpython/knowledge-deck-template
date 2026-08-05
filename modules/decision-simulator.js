export function init({ root }) {
  const button = root.querySelector('[data-simulate]'); const state = root.querySelector('[data-state]'); const detail = root.querySelector('[data-detail]');
  const steps = [['ASSUMPTION', 'Name the condition that must hold.'], ['EVIDENCE', 'Seek one observation that could change the choice.'], ['DECISION', 'Record the chosen path and review trigger.']]; let index = 0;
  function advance() { const [label, text] = steps[index]; state.textContent = label; detail.textContent = text; button.textContent = index === steps.length - 1 ? 'Restart test' : 'Test next signal'; index = (index + 1) % steps.length; if (window.gsap) gsap.fromTo(state, { opacity: .2, y: 8 }, { opacity: 1, y: 0, duration: .28 }); }
  button.addEventListener('click', advance); return () => button.removeEventListener('click', advance);
}
