document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const mainContent = document.getElementById("main-content");
    const showRegisterButton = document.getElementById("showRegister");
    const showLoginButton = document.getElementById("showLogin");
    const addMemberForm = document.getElementById("addMemberForm");
    const memberTableBody = document.getElementById("memberTableBody");
    const editMemberForm = document.getElementById("editMemberForm");
    const loadMemberButton = document.getElementById("loadMemberButton");

    //JSON DATA
    let familyData = {};
    let users = {};

    //Functions to load data from JSON files
    function loadJSON(url, callback){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            }else{
                console.error("Could not load JSON file: " + url);
            }
        };
        xhr.send();
    }

    //Function to save data to family_data.json(Not Functional)
    function saveData(){
        //Not Functional in client side environment. Would need backend
        console.log('Saving data is not possible in a static client-side environment.');
    }

     //Show or hide elements
    function toggleForms(showLogin) {
        if (showLogin) {
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        }
    }

    // FAKE User Authentication
    function authenticateUser(username, password) {
        if (users[username] === password) {
            return true;
        }
        return false;
    }

    //Load Users
    loadJSON("gebruikers.json", function(data){
        users = data;
    });

    //Load Family Data
    loadJSON("familie_data.json", function(data){
        familyData = data;
        displayMembers();
    });

    // Event listeners for switching between login and register forms
    showRegisterButton.addEventListener("click", function() {
        toggleForms(false);
    });

    showLoginButton.addEventListener("click", function() {
        toggleForms(true);
    });

    // Event listener for login form submission
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (authenticateUser(username, password)) {
            mainContent.style.display = "block";
            loginForm.style.display = "none";
            registerForm.style.display = "none";
            alert("Login Successful");
        } else {
            alert("Invalid Credentials");
        }
    });

    // Event listener for register form submission
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const newUsername = document.getElementById("newUsername").value;
        const newPassword = document.getElementById("newPassword").value;

        if (users[newUsername]) {
            alert("Username already exists");
        } else {
            users[newUsername] = newPassword;
            alert("Registration Successful");
            toggleForms(true);
        }

        // In the absence of a backend, you can't save the new user persistently.
        console.log("New user registered (but not saved): " + newUsername);
    });

    //function to add member
    addMemberForm.addEventListener("submit", function(event){
        event.preventDefault();
        const lid_id = document.getElementById("lid_id").value;
        const voornaam = document.getElementById("voornaam").value;
        const achternaam = document.getElementById("achternaam").value;
        const geboortedatum = document.getElementById("geboortedatum").value;
        const geslacht = document.getElementById("geslacht").value;
        const ouder1_id = document.getElementById("ouder1_id").value;
        const ouder2_id = document.getElementById("ouder2_id").value;
        const partner_id = document.getElementById("partner_id").value;

        if (familyData[lid_id]){
            alert("Lid ID already Exists")
            return;
        }

        familyData[lid_id] = {
            voornaam:voornaam,
            achternaam:achternaam,
            geboortedatum:geboortedatum,
            geslacht:geslacht,
            ouder1_id:ouder1_id,
            ouder2_id:ouder2_id,
            partner_id:partner_id
        };
        console.log("Member Added");

        displayMembers();

        //Clear the form fields
        addMemberForm.reset();
    });

    //Function to load member data for editing
    loadMemberButton.addEventListener("click", function(){
        const edit_lid_id = document.getElementById("edit_lid_id").value;
        if (familyData[edit_lid_id]){
            const member = familyData[edit_lid_id];
            document.getElementById("edit_voornaam").value = member.voornaam || "";
            document.getElementById("edit_achternaam").value = member.achternaam || "";
            document.getElementById("edit_geboortedatum").value = member.geboortedatum || "";
            document.getElementById("edit_geslacht").value = member.geslacht || "";
            document.getElementById("edit_ouder1_id").value = member.ouder1_id || "";
            document.getElementById("edit_ouder2_id").value = member.ouder2_id || "";
            document.getElementById("edit_partner_id").value = member.partner_id || "";
        } else {
            alert("Member not found.");
        }
    });

     // Function to handle editing an existing member
     editMemberForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const edit_lid_id = document.getElementById("edit_lid_id").value;
        const edit_voornaam = document.getElementById("edit_voornaam").value;
        const edit_achternaam = document.getElementById("edit_achternaam").value;
        const edit_geboortedatum = document.getElementById("edit_geboortedatum").value;
        const edit_geslacht = document.getElementById("edit_geslacht").value;
        const edit_ouder1_id = document.getElementById("edit_ouder1_id").value;
        const edit_ouder2_id = document.getElementById("edit_ouder2_id").value;
        const edit_partner_id = document.getElementById("edit_partner_id").value;

         if (familyData[edit_lid_id]) {
                familyData[edit_lid_id] = {
                    voornaam: edit_voornaam,
                    achternaam: edit_achternaam,
                    geboortedatum: edit_geboortedatum,
                    geslacht: edit_geslacht,
                    ouder1_id: edit_ouder1_id,
                    ouder2_id: edit_ouder2_id,
                    partner_id: edit_partner_id
                };

            alert("Member Edited");
            displayMembers();
            editMemberForm.reset();
        } else {
            alert("Member not found.  Edit failed.");
        }
     });


    // Function to display family members in the table
    function displayMembers() {
        memberTableBody.innerHTML = "";
        for (const lid_id in familyData) {
            const member = familyData[lid_id];
            const row = `<tr>
                            <td>${lid_id}</td>
                            <td>${member.voornaam || ""}</td>
                            <td>${member.achternaam || ""}</td>
                            <td>${member.geboortedatum || ""}</td>
                            <td>${member.geslacht || ""}</td>
                            <td>${member.ouder1_id || ""}</td>
                            <td>${member.ouder2_id || ""}</td>
                            <td>${member.partner_id || ""}</td>
                         </tr>`;
            memberTableBody.innerHTML += row;
        }
    }


  // Show login initially
  toggleForms(true);
});