const form = document.getElementById("admissionForm");

const resultCard = document.getElementById("resultCard");
const resultMessage = document.getElementById("resultMessage");
const applicationNumber = document.getElementById("applicationNumber");


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const course = document.getElementById("course").value;
    const previousSchool = document.getElementById("previousSchool").value.trim();
    const percentage = document.getElementById("percentage").value;
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value;
    const marksheet = document.getElementById("marksheet").files[0];



    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Please enter a valid 10 digit mobile number.");

        return;
    }



    // Percentage validation
    if (
        percentage === "" ||
        Number(percentage) < 0 ||
        Number(percentage) > 100
    ) {

        alert("Percentage must be between 0 and 100.");

        return;
    }



    // Marksheet validation
    if (!marksheet) {

        alert("Please upload your marksheet.");

        return;
    }



    // File size validation - 5 MB
    if (marksheet.size > 5 * 1024 * 1024) {

        alert("Marksheet file must be less than 5 MB.");

        return;
    }



    // Allowed file types
    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];


    if (!allowedTypes.includes(marksheet.type)) {

        alert("Only PDF, JPG, JPEG and PNG files are allowed.");

        return;
    }



    // Create FormData
    const formData = new FormData();


    formData.append(
        "fullName",
        firstName + " " + lastName
    );

    formData.append(
        "email",
        email
    );

    formData.append(
        "phone",
        phone
    );

    formData.append(
        "dob",
        dob
    );

    formData.append(
        "gender",
        gender
    );

    formData.append(
        "address",
        address + ", " + city + ", " + state
    );

    formData.append(
        "course",
        course
    );

    formData.append(
        "previousSchool",
        previousSchool
    );

    formData.append(
        "percentage",
        percentage
    );

    formData.append(
        "marksheet",
        marksheet
    );



    // Disable submit button
    const submitButton =
        form.querySelector(".submit-btn");

    submitButton.disabled = true;

    submitButton.innerText =
        "Submitting...";



    try {

        // Send data to backend
        const response = await fetch(
            "/submit-admission",
            {
                method: "POST",
                body: formData
            }
        );


        const result = await response.json();



        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Admission submission failed."
            );

        }



        // Show success
        resultMessage.innerText =
            "Congratulations " +
            result.student +
            "! Your admission application has been submitted successfully.";


        applicationNumber.innerText =
            "Application Number: " +
            result.applicationId;


        resultCard.style.display =
            "block";


        resultCard.scrollIntoView({
            behavior: "smooth"
        });



        console.log(
            "Admission submitted:",
            result
        );

    }


    catch (error) {

        console.error(error);

        alert(
            "Admission submission failed:\n\n" +
            error.message
        );

    }


    finally {

        submitButton.disabled = false;

        submitButton.innerText =
            "Submit Admission";

    }

});



/* =================================
   NEW APPLICATION
================================= */

function newApplication() {

    form.reset();

    resultCard.style.display =
        "none";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}