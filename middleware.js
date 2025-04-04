module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {   
        req.flash('error', 'Trebate se ulogirati kako bi pristupili stranici!');
        return res.redirect('/auth/login');
    }
    next();
}
module.exports.isStudent = (req, res, next) => {
    if(req.user.role !== 'student'){
        req.flash('error', 'Trebate se ulogirati kao student kako bi pristupili stranici!');
        return res.redirect('/admin');
    }
    next();
}
module.exports.isAdmin = (req, res, next) => {
    if(req.user.role !== 'admin'){
        req.flash('error', 'Trebate se ulogirati kao admin kako bi pristupili stranici!');
        return res.redirect('/student');
    }
    next();
}