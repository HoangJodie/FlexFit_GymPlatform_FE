export const exercisesOptions = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList',
    headers: {
    'x-rapidapi-key': 'e85b3db156mshec8ba980c1e893ep115218jsn8e722501da68',
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
  }
  };

export const fetchData = async (url, options) => {
    const response = await fetch(url, options)
    const data = await response.json();

    return data
}