/*
  Constants
*/
const KEY_LISTBOOK = "LIST_BOOK";
const DIALOG_DELETE = "Yakin ingin menghapus buku ini?";
const DIALOG_EDIT_SUCCESS = "Data telah diperbaharui";

const COMPLETED = true;

/*
  Variables
*/
let listBooks;
let listUnreadBooks;
let listReadBooks;

/* 
  Elements
*/
// New book
const inTitle = document.getElementById("inputBookTitle");
const inAuthor = document.getElementById("inputBookAuthor");
const inYear = document.getElementById("inputBookYear");
const inIsComplete = document.getElementById("inputBookIsComplete");
const bookSubmit = document.getElementById("inputBook");
// Search book
const inSearchTitle = document.getElementById("searchBookTitle");
const inSearchAuthor = document.getElementById("searchBookAuthor");
const searchSubmit = document.getElementById("searchBook");
// Book list
const unreadContainer = document.getElementById("incompleteBookshelfList");
const readContainer = document.getElementById("completeBookshelfList");
// Buttons
const btnBookSubmit = document.getElementById("bookSubmit");
// Containers
const containerFixed = document.getElementById("container-fixed");

/*
  Classes
*/
class Book {
  constructor(id, title, author, year, isComplete) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = year;
    this.isComplete = isComplete;
  }
}

/*
  Functions/Methods
*/
// Form
const resetForm = () => {
  inSearchTitle.value = "";
};

// Storage
const getList = (keyList) => {
  return localStorage.getItem(keyList);
};
const setList = (keyList, list) => {
  const stringsData = JSON.stringify(list);
  localStorage.setItem(keyList, stringsData);
};
const parseList = (keyList) => {
  const json = JSON.parse(getList(keyList));
  const list = [];
  if (json) {
    for (item of json) {
      list.push(Object.assign(new Book(), item));
    }
  }
  return list;
};

// Filter books
const filterByProgress = (list, progress) => {
  const result = [];
  list.forEach((book) => {
    if (book.isComplete == progress) result.push(book);
  });
  return result;
};
const filterBook = (list, title, author) => {
  const result = [];
  list.forEach((book) => {
    const bookTitle = book.title.toLowerCase();
    const bookAuthor = book.author.toLowerCase();
    if (
      bookAuthor.includes(author.toLowerCase()) &&
      bookTitle.includes(title.toLowerCase())
    )
      result.push(book);
  });
  return result;
};

// Modify book
const addBook = (list, newBook) => {
  const newList = list;
  newList.push(newBook);
  return newList;
};
const toggleProgressBook = (list, id) => {
  const result = list;
  const index = result.map((item) => item.id).indexOf(id);
  result[index].isComplete = !result[index].isComplete;
  return result;
};
const delBook = (list, id) => {
  const result = list;
  const index = result.map((item) => item.id).indexOf(id);
  result.splice(index, 1);
  return result;
};
const editBook = (list, id, editedBook) => {
  const result = list;
  const index = result.map((item) => item.id).indexOf(id);
  result[index] = editedBook;
  return result;
};

// Events
const eventAddBook = (list) => {
  const [id, title, author, year, isComplete] = [
    +new Date(),
    inTitle.value,
    inAuthor.value,
    inYear.value,
    inIsComplete.checked,
  ];
  const newBook = new Book(id, title, author, year, isComplete);
  const newList = addBook(list, newBook);
  setList(KEY_LISTBOOK, newList);
  alert("Berhasil ditambahkan!");
  renderAllList(newList);
  window.scrollTo({ top: unreadContainer.offsetTop });
};

const eventProgressBook = (list, id) => {
  const newList = toggleProgressBook(list, id);
  setList(KEY_LISTBOOK, newList);
  alert("Berhasil dipindahkan!");
  renderAllList(newList);
};

const eventDelBook = (list, id) => {
  resetForm();

  const newList = delBook(list, id);
  setList(KEY_LISTBOOK, newList);
  alert("Berhasil dihapus!");
  renderAllList(newList);
};

const eventSearchBook = (list) => {
  const title = inSearchTitle.value;
  const author = inSearchAuthor.value;
  // const newList = filterByTitle(list, title);
  const newList = filterBook(list, title, author);
  renderAllList(newList);
  window.scrollTo({ top: unreadContainer.offsetTop });
};

const eventSubmitEditedBook = (list, id, container) => {
  const newTitle = container.querySelector("#editBookTitle").value;
  const newAuthor = container.querySelector("#editBookAuthor").value;
  const newYear = container.querySelector("#editBookYear").value;
  const newProgress = container.querySelector("#editBookIsComplete").checked;

  const newBook = new Book(id, newTitle, newAuthor, newYear, newProgress);

  const newList = editBook(list, id, newBook);

  setList(KEY_LISTBOOK, newList);
  alert(DIALOG_EDIT_SUCCESS);
  eventCloseContainer(container);
  renderAllList(newList);
  window.scrollTo({ top: unreadContainer.offsetTop });
};

const eventCloseContainer = (container) => {
  container.style.display = "none";
};

/*
  Templates
*/
const templateBookItem = (book) => {
  const { id, title, author, year, isComplete } = book;
  const newArticle = document.createElement("article");
  newArticle.className = "book_item";

  newArticle.innerHTML = `
    <h3>${title}</h3>
    <p>Penulis: ${author}</p>
    <p>Tahun: ${year}</p>
  `;

  // Action container
  const newAction = document.createElement("div");
  newAction.className = "action";

  // Edit button
  const btnEdit = document.createElement("button");
  // btnEdit.className = "green";
  btnEdit.innerText = "Ubah data";
  btnEdit.onclick = () => displayEditBook(listBooks, book, containerFixed);

  // Progress button
  const btnProg = document.createElement("button");
  btnProg.className = "green";
  btnProg.innerText = `${isComplete ? "Belum dibaca" : "Selesai dibaca"}`;
  btnProg.onclick = () => eventProgressBook(listBooks, id);

  // Delete button
  const btnDel = document.createElement("button");
  btnDel.className = "red";
  btnDel.innerText = "Hapus buku";
  btnDel.onclick = () => eventDelBook(listBooks, id);

  // Append all to article
  newAction.append(btnProg, btnEdit, btnDel);
  newArticle.append(newAction);

  return newArticle;
};

const templateEditBook = (book) => {
  const { id, title, author, year, isComplete } = book;
  console.log(isComplete);
  return `
    <section class="input_section flex-column card">
      <h2>Edit buku ${title}</h2>
      <form id="form-editBook">
        <div class="input">
          <label for="editBookTitle">Judul</label>
          <input id="editBookTitle" type="text" value="${title}" required />
        </div>
        <div class="input">
          <label for="editBookAuthor">Penulis</label>
          <input id="editBookAuthor" type="text" value="${author}" required />
        </div>
        <div class="input">
          <label for="editBookYear">Tahun</label>
          <input id="editBookYear" type="number" value="${year}" required />
        </div>
        <div class="input_inline">
          <label for="editBookIsComplete">Selesai dibaca</label>
          <input id="editBookIsComplete" type="checkbox"/>
        </div>
        <button id="editSubmit" type="submit">Selesai</button>
      </form>
      <button class="red" id="editCancelSubmit">Batal</button>
    </section>
  `;
};
/*
  Render
*/
const renderList = (list, parentElement) => {
  parentElement.innerHTML = `
    <div>Kosong</div>
  `;

  if (list.length != 0) {
    parentElement.innerHTML = "";
    list.forEach((book) => {
      parentElement.append(templateBookItem(book));
    });
  }
};

const renderAllList = (list) => {
  listUnreadBooks = filterByProgress(list, !COMPLETED);
  listReadBooks = filterByProgress(list, COMPLETED);

  renderList(listUnreadBooks, unreadContainer);
  renderList(listReadBooks, readContainer);
};

const displayEditBook = (list, book, container) => {
  const id = book.id;

  container.innerHTML = templateEditBook(book);
  const submit = container.querySelector("#form-editBook");
  const btnCancel = container.querySelector("#editCancelSubmit");
  const checkbox = container.querySelector("#editBookIsComplete");
  checkbox.checked = book.isComplete;

  submit.onsubmit = (event) => {
    eventSubmitEditedBook(list, id, container);
    event.preventDefault();
  };
  btnCancel.onclick = () => {
    alert("Edit buku dibatalkan");
    eventCloseContainer(container);
  };
  container.style.display = "block";
};

/*
  Main script
*/
listBooks = parseList(KEY_LISTBOOK);

// Fetch lists
resetForm();
renderAllList(listBooks);

// New book
bookSubmit.addEventListener("submit", (event) => {
  eventAddBook(listBooks);
  event.preventDefault();
});

btnBookSubmit.querySelector("span").innerText = inIsComplete.checked
  ? "Selesai dibaca"
  : "Belum selesai dibaca";

inIsComplete.addEventListener("change", () => {
  btnBookSubmit.querySelector("span").innerText = inIsComplete.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
});

// Search book
searchSubmit.addEventListener("submit", (event) => {
  eventSearchBook(listBooks);
  event.preventDefault();
});
