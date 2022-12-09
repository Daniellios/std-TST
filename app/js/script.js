const locationSelector = document.getElementById("location_selector");
const locationDropdown = document.querySelector("#location-dropdown-menu");
const locationList = document.querySelector(".header__top-dropdown_list");
const locationDropdownInput = document.querySelector("#dropdown-search");

const chosenItemDeleteBtn = document.querySelector(
  ".header__top-dropdown_chosen-list_item_delete"
);

const chosenItemsList = document.querySelector(
  ".header__top-dropdown_chosen-list"
);

const citySearch = document.querySelector(".header__top-dropdown_input");
const clearSearchBtn = document.querySelector(".clear");
const saveBtn = document.querySelector(".btn_save");
const loader = document.querySelector(".loading");

const API_URL = "https://studika.ru/api/areas";

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json();
}

class Helper {
  constructor() {}

  initHelpers() {}
}

class App {
  areasList = [];
  chosenList = [];
  filteredList = [];

  constructor() {}

  init() {
    this.dropdownToggle();
    this.getData();
    this.handleSearch();
    this.deleteChoseItem();
    this.clearSearch();
    this.makeLocationRequest();
  }

  async getData() {
    await fetch(`${API_URL}`, { method: "POST" })
      .then((response) => {
        loader.classList.remove(".incative");
        loader.classList.add(".active");
        return response.json();
      })
      .then((response) => {
        this.areasList = this.formatAreasData(response);
        loader.classList.remove(".active");
        loader.classList.add(".incative");
      });

    locationList.append(...this.createDropdownList(this.areasList));
  }

  dropdownToggle() {
    locationSelector.addEventListener("click", (e) => {
      locationDropdown.classList.toggle("hidden");
    });
  }

  clearSearch() {
    clearSearchBtn.addEventListener("click", (e) => {
      console.log("here");
      this.chosenList = [];
      citySearch.value = "";
      clearSearchBtn.classList.remove("active");
      clearSearchBtn.classList.add("incative");
      locationList.append(...this.createDropdownList(this.areasList));
    });
  }

  makeLocationRequest() {
    saveBtn.addEventListener("click", () => {
      postData(API_URL, { data: this.chosenList }).then((data) => {
        this.chosenList = [];
        this.createChosenList();
      });
    });
  }

  formatAreasData(data) {
    const formatedList = [];
    data.map((state) => {
      if (state.cities) {
        state.cities.map((city) => {
          formatedList.push({
            cityName: city.name,
            stateName: state.name,
            id: city.id,
          });
        });
      }
      formatedList.push({ stateName: state.name, cityName: "", id: state.id });
    });
    return formatedList;
  }

  handleSearch() {
    citySearch.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      console.log(value);
      if (value) {
        clearSearchBtn.classList.add("active");
      } else {
        clearSearchBtn.classList.remove("active");
        clearSearchBtn.classList.add("incative");
      }

      this.filteredList = this.areasList.filter((state) => {
        if (
          state.cityName.toLowerCase().includes(value) ||
          state.stateName.toLowerCase().includes(value)
        ) {
          return state;
        }
      });
      locationList.replaceChildren("");
      let newElList = this.createDropdownList(this.filteredList);
      locationList.append(...newElList);
    });
  }

  createDropdownList(list) {
    return list.map((info) => {
      let item = this.createDropdownItem(info);
      return item;
    });
  }

  createDropdownItem(info) {
    let pCity = document.createElement("p");
    let pState = document.createElement("p");
    let locItem = document.createElement("div");
    pCity.classList.add("header__top-dropdown_list_item_city");
    pState.classList.add("header__top-dropdown_list_item_state");
    locItem.classList.add("header__top-dropdown_list_item");
    if (info.cityName) {
      pState.innerHTML = `${info.stateName}`;
      pCity.innerHTML = `${info.cityName}`;
      locItem.dataset.id = info.id;
      locItem.appendChild(pCity);
      locItem.appendChild(pState);
    } else {
      pCity.innerHTML = `${info.stateName}`;
      locItem.dataset.id = info.id;
      locItem.appendChild(pCity);
    }
    locItem.addEventListener("click", (e) => {
      const targetState = e.target.parentElement.firstChild.innerHTML;
      const targetId = e.target.parentElement.dataset.id;
      this.updateChosenList(targetState, targetId);
    });
    return locItem;
  }

  createChosenItem(name, id) {
    let locItem = document.createElement("div");
    locItem.classList.add("header__top-dropdown_chosen-list_item");
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("header__top-dropdown_chosen-list_item_delete");
    let chState = document.createElement("p");
    chState.innerHTML = name;
    deleteBtn.innerHTML = "X";
    locItem.dataset.id = id;
    locItem.append(chState);
    locItem.append(deleteBtn);
    return locItem;
  }

  deleteChoseItem() {
    chosenItemsList.addEventListener("click", (e) => {
      const tagNAME = e.target.tagName;
      const itemID = e.target.parentElement.dataset.id;
      if (tagNAME === "BUTTON") {
        this.chosenList = this.chosenList.filter((item) => {
          if (item.id !== itemID) {
            return item;
          }
        });
      }
      this.createChosenList();
    });
  }

  createChosenList() {
    chosenItemsList.replaceChildren("");
    const newLISt = [];
    this.chosenList.forEach((item) => {
      let newItem = this.createChosenItem(item.chosenCity, item.id);
      newLISt.push(newItem);
    });
    chosenItemsList.append(...newLISt);
  }

  updateChosenList(chosenCity, id) {
    if (this.chosenList.find((e) => e.id === id)) {
      this.chosenList = this.chosenList.filter((item) => item.id !== id);
    } else {
      this.chosenList.push({ chosenCity: chosenCity, id: id });
    }
    this.createChosenList();
  }
}

// Instantiating the global app object
const app = new App();
app.init();