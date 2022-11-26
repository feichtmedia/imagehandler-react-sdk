const imageTargets =
  "[data-src], [data-dark-src], [data-light-src], [data-srcset]";

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
const imgObserver = new IntersectionObserver((entries, imgObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    } else {
      setSrc(entry.target); // Set `src` and `srcset`
      imgObserver.unobserve(entry.target); // Unobserve target
    }
  });
}, imgOptions);

/**
 * Attach the Intersection Observer to all image nodes on the page
 */
function attachImageObserver(): void {
  // Select all images
  const images = document.querySelectorAll(imageTargets);

  // Set observer to all images
  images.forEach((image) => {
    imgObserver.observe(image);
  });
}

/**
 * Remove the Intersection Observer from all image nodes on the page
 */
function removeImageObserver(): void {
  // Select all images
  const images = document.querySelectorAll(imageTargets);

  // Remove observer from all images
  images.forEach((image) => {
    imgObserver.unobserve(image);
  });
}

/**
 * Set image source values from data-set to attributes
 * @param target Target element to perform actions on
 */
function setSrc(target: any): void {
  // Get values from dataset
  const src = target.dataset?.src;
  const srcSet = target.dataset?.srcset;

  // Set values to target
  if (src) target.src = src;
  if (srcSet) target.srcset = srcSet;

  // Remove values from dataset
  if (src) target.removeAttribute("data-src");
  if (srcSet) target.removeAttribute("data-srcset");
}
