(function() {
    function validEmail(email) { // see:
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      return re.test(email);
    }
  
    function validateHuman(honeypot) {
      if (honeypot) {  //if hidden form filled up
        console.log("Robot Detected!");
        return true;
      } else {
        console.log("Welcome Human!");
      }
    }
  
    // get all data in form and return object
    function getFormData() {
      var form = document.getElementById("gform");
      var elements = form.elements;
  
      var fields = Object.keys(elements).filter(function(k) {
            return (elements[k].name !== "honeypot");
      }).map(function(k) {
        if(elements[k].name !== undefined) {
          return elements[k].name;
        // special case for Edge's html collection
        }else if(elements[k].length > 0){
          return elements[k].item(0).name;
        }
      }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos && item;
      });
  
      var formData = {};
      fields.forEach(function(name){
        var element = elements[name];
        
        // singular form elements just have one value
        formData[name] = element.value;
  
        // when our element has multiple items, get their values
        if (element.length) {
          var data = [];
          for (var i = 0; i < element.length; i++) {
            var item = element.item(i);
            if (item.checked || item.selected) {
              data.push(item.value);
            }
          }
          formData[name] = data.join(', ');
        }
      });
  
      // add form-specific values into the data
      formData.formDataNameOrder = JSON.stringify(fields);
      formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
      formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default
  
      console.log(formData);
      return formData;
    }
  
    function handleFormSubmit(event) {  // handles form submit without any jquery
      event.preventDefault();           // we are submitting via xhr below
      var data = getFormData();         // get the values submitted in the form
  
      /* OPTION: Remove this comment to enable SPAM prevention, see README.md
      if (validateHuman(data.honeypot)) {  //if form is filled, form will not be submitted
        return false;
      }
      */
     var invalidName = document.getElementById("name-invalid");
     var invalidEmail = document.getElementById("email-invalid");
     if( data.name.length === 0 ) {   // if email is not valid show error
        if (invalidName) {
          invalidName.style.display = "block";
          return false;
        }
      }
  
      else if( (data.email && !validEmail(data.email)) || data.email.length === 0 ) {   // if email is not valid show error
        if (invalidEmail) {
          invalidEmail.style.display = "block";
          invalidName.style.display = "none";
          return false;
        }
      } else {
        disableAllButtons(event.target);
        invalidEmail.style.display = "none";
        invalidName.style.display = "none";
        //var url = event.target.action;  //
        var url = "https://script.google.com/macros/s/AKfycbxeqNb3Ra-fgPTfHu-c36IyuFtQpv5rMyVXgFx-oUjnZxC5OjE/exec"
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        // xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            console.log( xhr.status, xhr.statusText )
            console.log(xhr.responseText);
            document.getElementById("gform").style.display = "none"; // hide form
            var thankYouMessage = document.getElementById("thankyou_message");
            var feedbackLine = document.getElementById("askForFeedback");
            if (thankYouMessage) {
              thankYouMessage.style.display = "block";
              feedbackLine.style.display = "none";
            }
            return;
        };
        // url encode form data for sending as post data
        var encoded = Object.keys(data).map(function(k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(data[k])
        }).join('&')
        xhr.send(encoded);
      }
    }
    function loaded() {
      console.log("Contact form submission handler loaded successfully.");
      // bind to the submit event of our form
      var form = document.getElementById("gform");
      form.addEventListener("submit", handleFormSubmit, false);
    };
    document.addEventListener("DOMContentLoaded", loaded, false);
  
    function disableAllButtons(form) {
      var buttons = form.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
      }
    }
  })();