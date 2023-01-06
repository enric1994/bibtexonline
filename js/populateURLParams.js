const queryString = window.location.search; // ?bibtex="@inproceedings..."
const urlParams = new URLSearchParams(queryString);

let bibtexStr = urlParams.get("bibtex"); // "@inproceedings...
let formatStr = urlParams.get("format"); // "chicago"

// Element Refs
var fromArea = document.getElementById("from");
var formatJQ = $("#format");

parseUrlParam(bibtexStr, formatStr);

// HELPERS
function parseUrlParam(bibtexStr, formatStr) {
  /**
   * bibtex: string with "",
   * format?: optional string 'apa' | 'mla' | 'chicago' | 'harvard' | 'vancouver'
   */

  if (!bibtexStr) return;

  // -- 1. Clean and Validate bibtex ---
  bibtexStr = bibtexStr.trim();

  // Bibtex must have quotation marks on both ends. Cancel operation if not.
  if (!hasQuotesOnBothEnds(bibtexStr)) return;
  bibtexStr = bibtexStr.slice(1, bibtexStr.length - 1); // Remove the quotation marks on both ends

  //   -- 2. Clean and Validate format --
  if (formatIsValid(formatStr)) formatJQ.val(formatStr).trigger("change");

  //   -- 3. Perform operation --
  fromArea.value = bibtexStr;
  convert();
}

function hasQuotesOnBothEnds(str) {
  const firstChar = str.charAt(0);

  // If the first character is either ", ', or `
  if (firstChar === "'" || firstChar === '"' || firstChar === "`") {
    const lastChar = str.charAt(str.length - 1);

    if (firstChar === lastChar) return true;
    else return false;
  }

  return false;
}

function formatIsValid(str) {
  if (str) {
    if (
      ["apa", "mla", "chicago", "harvard", "vancouver"].includes(
        str.toLowerCase()
      )
    ) {
      return true;
    }
  }
  return false;
}
