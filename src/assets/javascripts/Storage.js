export function storageAvailable(type) {
  var storage;
  try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          (storage && storage.length !== 0);
  }
};

export class Storage {
  constructor(){}

  getBrands(){ return this.getObjectFromStorage('brands'); }
  setBrands(arr){ return this.putObjectInStorage('brands', arr); }

  getCategories(){ return this.getObjectFromStorage('categories'); }
  setCategories(arr){ return this.putObjectInStorage('categories', arr); }

  getCertificates(){ return this.getObjectFromStorage('certificates'); }
  setCertificates(arr){ return this.putObjectInStorage('certificates', arr); }

  getFamilies(){ return this.getObjectFromStorage('families'); }
  setFamilies(arr){ return this.putObjectInStorage('families', arr); }

  getGroups(){ return this.getObjectFromStorage('groups'); }
  setGroups(arr){ return this.putObjectInStorage('groups', arr); }

  getImageTypes(){ return this.getObjectFromStorage('image_types'); }
  setImageTypes(arr){ return this.putObjectInStorage('image_types', arr); }

  getLifecycles(){ return this.getObjectFromStorage('lifecycles'); }
  setLifecycles(arr){ return this.putObjectInStorage('lifecycles', arr); }

  getProductTypes(){ return this.getObjectFromStorage('product_types'); }
  setProductTypes(arr){ return this.putObjectInStorage('product_types', arr); }

  getSuppliers(){ return this.getObjectFromStorage('suppliers'); }
  setSuppliers(arr){ return this.putObjectInStorage('suppliers', arr); }

  getTechnologies(){ return this.getObjectFromStorage('technologies'); }
  setTechnologies(arr){ return this.putObjectInStorage('technologies', arr); }

  getObjectFromStorage(key){ let str = window.localStorage.getItem(key); return str ? JSON.parse(str) : []; };
  putObjectInStorage(key, obj){ if(!obj){return;} window.localStorage.setItem(key,JSON.stringify(obj)); };
  getStringFromStorage(key){ let str = window.localStorage.getItem(key); return str; }
  putStringInStorage(key, str){ window.localStorage.setItem(key,str); }

  install(Vue){
    if(!storageAvailable("localStorage")){
      console.error("This app uses browser local storage for better performance. Please enable local storage or use a different browser.");
      return null;
    }
    Vue.storage = this;
  }
}

