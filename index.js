const dropArea = document.getElementById('drop-area');
const bookEmojis = ['📕', '📙', '📒', '📗', '📘', '📓', '📔'];

function download(element, filename, contents) {
  element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(contents));
  element.setAttribute('download', filename);
  element.classList.add("book-url")

}

dropArea.addEventListener('dragover', (event) => {
  event.stopPropagation();
  event.preventDefault();
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = 'copy';
});

dropArea.addEventListener('drop', (event) => {
  event.stopPropagation();
  event.preventDefault();
  const fileList = event.dataTransfer.files;
  if (!validateType(fileList)) return null;

  readFile(fileList[0]);
});

function validateType(fileList) {
  for (const file of fileList) {
    const type = file.type
    if (type != 'text/plain') {
      alert("Only .txt files are supported");
      return false;
    } else {
      return true;
    }
  }
};

// Utility functions
const cleanUp = (str) => str.replace(/[\n\r]+/g, '');
const getAttribute = (attributes, index, regex = null) => {
  let attr = cleanUp(attributes[index]);
  return regex ? attr.split(regex).filter(Boolean)[1] : attr;
};

// Core functionality
function parseClippings(contents) {
  const separator = '==========';
  const timestampRegex = /Added on|Добавлено|Añadido el\:*/;

  const clippings = contents.split(separator);

  return clippings.map(clipping => {
    const attributes = clipping.split("\n");
    // Each clipping contains unnecessary auto-generated chunks of symbols like "\r" which we don't need and are not treating them as meaningful
    const cleanedUpAttributes = attributes.filter(attr => attr !== "\r" && attr !== '');

    // Skipping current clipping if no text is contained within a clipping, only datetime and book title
    if (cleanedUpAttributes.length < 3) return null;

    const title = getAttribute(cleanedUpAttributes, 0);
    const timestamp = getAttribute(cleanedUpAttributes, 1, timestampRegex);
    const text = getAttribute(cleanedUpAttributes, 2);

    return {title: title, text: text, timestamp: timestamp};
  }).filter(value => value);
}

function readFile(file) {
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      console.log("Reading the file");
      const contents = event.target.result;

      console.log("Parsing clippings");
      const parsed = parseClippings(contents);

      console.log("Grouping clippings by titles");
      const groupByTitles = groupBy('title');
      const grouped = groupByTitles(parsed);

      booksTitles = Object.keys(grouped);

      document.getElementById('separator').innerHTML = '. . .';
      document.getElementById('status').innerHTML = '✨ Success! Found some clippings:';

      console.log("Rendering book titles");
      let bookIndex = 0;
      for (const title in grouped) {
        amountOfClippings = grouped[title].length;

        renderBook(grouped, title, amountOfClippings, bookIndex);

        (bookIndex >= bookEmojis.length - 1) ? bookIndex = 0 : bookIndex++;
      }
      console.log("Done!")

    } catch(error) {
      console.error(error);  // this will log the error message to the console
    }
  };

  reader.readAsText(file);
}

function renderBook (books, title, amountOfClippings, bookIndex) {
  // create a new div element
  var newDiv = document.createElement("div");
  var anchor = document.createElement("a");
  anchor.id = `book-${bookIndex}`
  // and give it some content
  var paragraph = document.createElement("p");
  var newContent = document.createTextNode(`${bookEmojis[bookIndex]} ${title}: ${amountOfClippings}`);
  // add the text node to the newly created div
  paragraph.appendChild(newContent);
  anchor.appendChild(paragraph);
  newDiv.appendChild(anchor);
  newDiv.classList.add("book");
  // add the newly created element and its content into the DOM
  var booksList = document.getElementById("books-list");
  var firstChild = booksList.firstChild;

  var contents = generateMarkdown(title, books);

  var filename = title.replace(/\"/gi,"'").replace(/[\\\/"\*\:\?<>|]/gi, '');
  download(anchor, `${filename}.md`, contents);
  booksList.insertBefore(newDiv, firstChild);
}

function generateMarkdown(title, books) {
  currentBook = books[title];
  var str = ''
  for (clipping of currentBook) {
    str += `> ${clipping['text']}\n\n${clipping['timestamp']}\n\n`;
  }
  return str;
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
