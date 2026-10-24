// Legacy producer settings are kept for save compatibility. As of 2026-10-24, the full 2F desk/order/shelf/catch route is required regardless of these old optional flags.
export const courseSettings = {
  showDeskInterlude:true,
  includeNewBooks:true,
  newBooksExactLocation:null
};
export function normalizeCourseOptions(value=courseSettings) {
  return {showDeskInterlude:typeof value?.showDeskInterlude==='boolean'?value.showDeskInterlude:courseSettings.showDeskInterlude,
    includeNewBooks:typeof value?.includeNewBooks==='boolean'?value.includeNewBooks:courseSettings.includeNewBooks};
}
