export function createObjectURL(file) {
  if (window.webkitURL) {
    return window.webkitURL.createObjectURL(file);
  }
  return window.URL.createObjectURL(file);
}
