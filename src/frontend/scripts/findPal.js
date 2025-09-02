async function languageList() {
  
  const dropdown = document.querySelector(".language-select");

  try {
    const response = await fetch("https://api.languagetoolplus.com/v2/languages");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.status);
    }

    const languages = await response.json(); 


      const uniqueNames = new Set();
    languages.forEach(lang => {
      
      let cleanName = lang.name.split("(")[0].trim();
      uniqueNames.add(cleanName);
    });

    const sortedLanguages = Array.from(uniqueNames).sort();

    dropdown.innerHTML = '<option value="">-- Select Language --</option>';

    // Loop through language objects
    sortedLanguages.forEach(langName => {
      const option = document.createElement("option");
      option.textContent = langName;   
      option.value = langName.toLowerCase();        
      dropdown.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading languages:", error);
    dropdown.innerHTML = '<option value="">Error loading languages</option>';
  }
}

document.addEventListener("DOMContentLoaded", languageList);
