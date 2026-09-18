const imageTargets =
  "img[data-src], img[data-srcset], picture source[data-src], picture source[data-srcset]";

/**
 * Function to add lazy loading with Intersection Observer to a page.
 */
export function addLazyLoading(): void {
  attachImageObserver();
}

/**
 * Function to remove lazy loading with Intersection Observer from a page.
 */
export function removeLazyLoading(): void {
  removeImageObserver();
}

/**
 * Create an Intersection Observer
 */
// Image observer options
const imgOptions: IntersectionObserverInit = {
  threshold: 0,
  rootMargin: "200px 0px 200px 0px",
};

// Image observer if image is on viewport
let imgObserver: IntersectionObserver | null = null;

/**
 * Check whether the functions can run at all.
 *
 * The helpers are called from the consumer's `useEffect`, but a consumer may
 * also call them during server-side rendering or in a test environment without
 * a DOM, where `document` does not exist.
 * @returns `true` if a DOM is available
 */
function hasDocument(): boolean {
  return typeof document !== "undefined";
}

/**
 * Attach the Intersection Observer to all image nodes on the page
 */
function attachImageObserver(): void {
  // No DOM, nothing to observe
  if (!hasDocument()) return;

  // Always tear down a previous observer first. Without this, calling
  // `addLazyLoading()` twice — for example in React's StrictMode or on a route
  // change — would leak the previous observer and leave it attached.
  removeImageObserver();

  // Select all images
  const images = document.querySelectorAll(imageTargets);

  // Fall back to loading every image immediately when the browser has no
  // Intersection Observer, so the images never stay on the blurred placeholder
  if (typeof IntersectionObserver === "undefined") {
    images.forEach((image) => setSrc(image));
    return;
  }

  // Create image observer
  imgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      } else {
        setSrc(entry.target); // Set `src` and `srcset`
        observer.unobserve(entry.target); // Unobserve target
      }
    });
  }, imgOptions);

  // Set observer to all images
  images.forEach((image) => {
    imgObserver?.observe(image);
  });
}

/**
 * Remove the Intersection Observer from all image nodes on the page
 */
function removeImageObserver(): void {
  // `disconnect()` also covers elements that are no longer in the DOM and
  // elements whose data attributes were already swapped, which a query for the
  // still-matching elements would miss
  imgObserver?.disconnect();
  imgObserver = null;
}

/**
 * Set image source values from data-set to attributes
 * @param target Target element to perform actions on
 */
function setSrc(target: Element): void {
  const imageElement = target as HTMLImageElement | HTMLSourceElement;

  // Get values from dataset
  const src = imageElement.dataset?.src;
  const srcSet = imageElement.dataset?.srcset;

  // Set values to target
  if (src) imageElement.src = src;
  if (srcSet) imageElement.srcset = srcSet;

  // Remove values from dataset
  if (src) imageElement.removeAttribute("data-src");
  if (srcSet) imageElement.removeAttribute("data-srcset");
}
