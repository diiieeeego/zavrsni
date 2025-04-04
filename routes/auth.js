const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const Student = require('../models/student');
const Admin = require('../models/admin')
const User = require('../models/user')

router.get('/register', (req, res) => {
    
    res.render('auth/register');
});

//registracija novog studenta
router.post('/registerStudent', catchAsync(async (req, res, next) => {
    try {
        const { username, email, ime, prezime, dob, status, password } = req.body;
        const user = new User({username, role: 'student'})
        
        const student = new Student({ username, email, ime, prezime, dob, status});
        await student.save();
        const noviUser = await User.register(user, password);
        req.login(noviUser, err => {
            if (err) return next(err);
            req.flash('success', 'Dobrodošli u eStudent!');
            res.redirect(`/student`);
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/auth/register');
    }
}));

router.post('/registerAdmin', catchAsync(async (req, res, next) => {
    try {
        const { username, email, ime, prezime, password } = req.body;

        // Check if username is provided
        if (!username || !email || !password) {
            req.flash('error', 'Username, email, and password are required!');
            return res.redirect('/auth/register');
        }

        // Check if username already exists in User collection
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Username is already taken!');
            return res.redirect('/auth/register');
        }

        // Create and save admin
        const admin = new Admin({ username, email, ime, prezime });
        await admin.save();

        // Create and register user
        const user = new User({ username, role: 'admin' });
        const noviUser = await User.register(user, password);

        // Login the newly registered user
        req.login(noviUser, err => {
            if (err) return next(err);
            req.flash('success', 'Dobrodošli u eStudent!');
            res.redirect(`/admin`);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/auth/register');
    }
}));


router.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('/');
    }
    res.render('auth/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/auth/login' }), (req, res) => {
    req.flash('success', 'Dobrodošli!');
    if(req.user.role === 'student'){
        res.redirect('/student');
    }else if(req.user.role === 'admin'){
        res.redirect('/admin')
    }
    
})


router.get('/logout', (req, res) => {
    req.logout((e) => 'callback');
    req.flash('success', "Doviđenja!");
    res.redirect('/auth/login');
})

module.exports = router;