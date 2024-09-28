const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { userModel } = require("./models/user")
const { adminModel } = require("./models/admin")
const { caretakerModel } = require("./models/caretaker")
const { driverModel } = require("./models/driver")

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
    console.log(hashedPassword)

    input.password = hashedPassword     //stored the hashed password to server
    let user = new userModel(input)
    user.save()
    console.log(user)
    res.json({ "status": "success" })
})

//----------------------------------USER SIGN IN-----------------------------------

app.post("/usersignin", (req, res) => {
    let input = req.body
    userModel.find({ "emailid": req.body.emailid}).then(
        (response) => {
            if (response.length > 0) {
                let dbPassword = response[0].password  //entered email is compared with existing password(email)
                console.log(dbPassword)
                bcrypt.compare(input.password, dbPassword, (error, isMatch) => { //input pswd and hashed pswd is  compared
                    if (isMatch) {
                        //if login success generate token
                        jwt.sign({ emailid: input.emailid }, "elder-app", { expiresIn: "1d" },
                            (error, token) => {
                                if (error) {
                                    res.json({ "status": "unable to create token" })
                                } else {
                                    res.json({ "status": "success", "userid": response[0]._id, "token": token })
                                }
                            }
                        )
                    } else {
                        res.json({ "status": "incorrect" })
                    }
                })

            } else {
                res.json({ "status": "user not found" })
            }
        }
    ).catch()
})

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


app.listen(8080, () => {
    console.log("server started")
})