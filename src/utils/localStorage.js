export const setItem = (key, value) => {
console.log('local storage')
  localStorage.setItem(key, value);

};

export const getItem = (key) => {
   return localStorage.getItem(key);
  
  
  };
  