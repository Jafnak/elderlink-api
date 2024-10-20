const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { userModel } = require("./models/user")
const { adminModel } = require("./models/admin")
const { caretakerModel } = require("./models/caretaker")
const { driverModel } = require("./models/driver")
const { doctorModel } = require("./models/doctor")
const { Appointment } = require("./models/appointment")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://Jafna02:jafna9074@cluster0.icijy.mongodb.net/ElderlinkDb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)  //salt=cost factor value
    return bcrypt.hash(password, salt)
}

//---------------------USER SIGNUP----------------------------------------------------------------

app.post("/usersignup", async (req, res) => {

    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    //console.log(hashedPassword)

    input.password = hashedPassword     //stored the hashed password to server
    let user = new userModel(input)
    user.save()
    //console.log(user)
    res.json({ "status": "success" })
})
//--------------------------------USER VIEW-------------------------------
app.post("/userview",(req,res)=>{
    userModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})



//----------------------------------USER SIGN IN-----------------------------------

app.post("/usersignin", (req, res) => {
    let input = req.body;

    // Check if the role exists in the request
    if (!input.role) {
        return res.json({ "status": "role not specified" });
    }

    // Select the appropriate model based on the user's role
    let model;
    switch (input.role) {
        case 'user':
            model = userModel;
            break;
        case 'doctor':
            model = doctorModel;
            break;
        case 'driver':
            model = driverModel;
            break;
        case 'caretaker':
            model = caretakerModel;
            break;
        default:
            return res.json({ "status": "invalid role" });
    }

    // Perform login based on the selected model
    model.findOne({ emailid: input.emailid })
        .then((user) => {
            if (user) {
                // Define static passwords for roles
                const staticPasswords = {
                    doctor: "doctor987",
                    driver: "driver986",
                    caretaker: "caretaker985",
                };

                // Check if the role matches the user's role
                if (input.role in staticPasswords) {
                    // If the user role is one of the static roles, check against the static password
                    if (input.password === staticPasswords[input.role]) {
                        // If login is successful, generate a token
                        jwt.sign({ emailid: user.emailid, role: user.role }, "elder-app", { expiresIn: "1d" },
                            (error, token) => {
                                if (error) {
                                    res.json({ "status": "unable to create token" });
                                } else {
                                    res.json({ "status": "success", "userid": user._id, "token": token });
                                }
                            }
                        );
                    } else {
                        res.json({ "status": "incorrect password" });
                    }
                } else {
                    // For users without a static password (dynamic password check)
                    let dbPassword = user.password; // Get the hashed password from the database

                    // Compare input password with the hashed password
                    bcrypt.compare(input.password, dbPassword, (error, isMatch) => {
                        if (isMatch) {
                            // If login is successful, generate a token
                            jwt.sign({ emailid: user.emailid, role: user.role }, "elder-app", { expiresIn: "1d" },
                                (error, token) => {
                                    if (error) {
                                        res.json({ "status": "unable to create token" });
                                    } else {
                                        res.json({ "status": "success", "userid": user._id, "token": token });
                                    }
                                }
                            );
                        } else {
                            res.json({ "status": "incorrect password" });
                        }
                    });
                }
            } else {
                res.json({ "status": "user not found" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ "status": "error", "message": "Internal Server Error" });
        });
});



//----------------------------ADMIN LOGIN----------------------------------------------

app.post("/adminlogin", (req, res) => {
    let input = req.body;

    // Default admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if the input matches admin credentials
    if (input.emailid === adminEmail && input.password === adminPassword) {
        // Admin login successful
        jwt.sign({ emailid: input.emailid }, "elder-app", { expiresIn: "1d" }, (error, token) => {
            if (error) {
                res.json({ "status": "Token credentials failed" });
            } else {
                res.json({ "status": "success", "token": token, "message": "Admin logged in successfully" });
            }
        });
    } else {
        // Check if the user exists in the database
        adminModel.find({ name: input.emailid }).then((response) => {
            if (response.length > 0) {
                const validator = bcrypt.compareSync(input.password, response[0].password);
                if (validator) {
                    // User login successful
                    jwt.sign({ emailid: input.emailid}, "elder-app", { expiresIn: "1d" }, (error, token) => {
                        if (error) {
                            res.json({ "status": "Token credentials failed" });
                        } else {
                            res.json({ "status": "success", "token": token });
                        }
                    });
                } else {
                    res.json({ "status": "Wrong password" });
                }
            } else {
                res.json({ "status": "Username doesn't exist" });
            }
        }).catch((err) => {
            res.json({ "status": "Error occurred", "error": err.message });
        });
    }
});



//-------------------------------ADD CARETAKER------------------------------------------
app.post("/addcaretaker",(req,res)=>{
    let input=req.body
    let caretaker = new caretakerModel(input)
    caretaker.save()
    res.json({"status":"success"})
})

//-----------------------------------VIEW CARETAKERS---------------------------------------
app.post("/caretakerview",(req,res)=>{
    caretakerModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})
//------------------------------------ADD DRIVERS--------------------------------------------
app.post("/adddriver",(req,res)=>{
    let input=req.body
    let driver = new driverModel(input)
    driver.save()
    res.json({"status":"success"})
})
//--------------------------------VIEW DRIVERS--------------------------------------------------
app.post("/driverview",(req,res)=>{
    driverModel.find().then(
        (data)=>{
            res.json(data)
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})


//------------------------------------ADD DOCTORS--------------------------------------------
app.post("/adddoctor",(req,res)=>{
    let input=req.body
    let doctor = new doctorModel(input)
    doctor.save()
    res.json({"status":"success"})
})

//--------------------------------VIEW DOCTOR--------------------------------------------------
app.post("/doctorview", (req, res) => {
    doctorModel.find() // Assuming you're fetching doctors from a Doctor model
        .then(doctors => {
            // Map to include appointment fees in the response
            const doctorData = doctors.map(doctor => ({
                _id: doctor._id,
                name: doctor.name,
                specialization: doctor.specialization,
                location: doctor.location,
                phone: doctor.phone,
                appointmentFee: 250 // Set static fee or fetch from the database if needed
            }));
            res.json(doctorData);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Error fetching doctor data' });
        });
});



// app.post("/doctorview",(req,res)=>{
//     doctorModel.find().then(
//         (data)=>{
//             res.json(data)
//         }
//     ).catch(
//         (error)=>{
//             res.json(error)
//         }
//     )
// })


//-------------AVAILABILITY--------------

app.post('/updateAvailability', (req, res) => {
    const { doctorId, availability } = req.body;
    
    doctorModel.findByIdAndUpdate(doctorId, { availability }, { new: true })
        .then(updatedDoctor => {
            // Optionally send a message to the doctor via email or notification system here
            res.json({ status: "success", doctor: updatedDoctor });
        })
        .catch(err => {
            res.json({ status: "error", message: err.message });
        });
});

//---------------------BOOK APPOINT-----------------------------


 // For parsing application/json

// Connect to MongoDB


// When booking an appointment, include the user's email
const bookAppointment = (req, res) => {
  const { doctorName, date, time, userEmail } = req.body; // Assuming you're sending userEmail from the frontend
  
  const newAppointment = new Appointment({
    doctorName,
    date,
    time,
    userEmail // Save the user's email who booked the appointment
  });

  newAppointment.save()
    .then(() => {
      // Fetch user details after saving the appointment
      return userModel.findOne({ emailid: userEmail }); // Change 'emailid' based on your user model
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "Appointment booked successfully!",
        userDetails: {
          name: user.name,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
          age: user.age,
          guardian: user.gardian,
          guardianEmail: user.gardemail,
        },
      });
    })
    .catch(err => {
      res.status(500).json({ message: "Error booking appointment", error: err.message });
    });
};



// Start the server


  



app.listen(8080, () => {
    console.log("server started")
})