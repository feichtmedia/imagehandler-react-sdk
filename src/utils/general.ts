/**
 * Prepare the image `src` value for the use in other functions.
 * @param src Image source value
 * @returns Prepared source value
 */
export function prepareSrc(src: string): string {
  // Store new `src` value in variable
  let preparedSrc = "";

  // Split old `src` value by "/"
  // Create new `src` out of splitted parts
  src.split("/").forEach((part) => {
    if (part !== "") preparedSrc = `${preparedSrc}/${part}`;
  });

  // Return prepared src
  return preparedSrc;
}

/**
 * Helper function to check if the image has a specific filetype by checking the file extension.
 * @param filename Filename to check
 * @param filetype Filetype to check on the image
 * @returns Check result. `true` if the image has the filetype
 */
export function checkFiletype(filename: string, filetype: string): boolean {
  // Split filename at the "."
  const splittedFilename = filename.split(".");

  // Get file extension from filename by splitting it
  const fileExtension = splittedFilename[splittedFilename.length - 1];

  // Return check result by comparing `fileExtension` with `filetype`
  return fileExtension === filetype;
}
