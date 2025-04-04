const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError.js');
const { studentSchema, kolegijSchema } = require("../schemas.js");
const { isLoggedIn, isAdmin } = require('../middleware.js');

const Ispit = require('../models/ispit');
const Student = require('../models/student');
const Kolegij = require('../models/kolegij');

const provjeriKolegij = (req, res, next) => {
    const { error } = kolegijSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const provjeriStudenta = async (req, res, next) => {
    const { error } = studentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.get('/', isLoggedIn, isAdmin, (req, res) => {
    res.render('adminHome');
})
//Izradu novog kolegija
router.post('/kolegiji', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegij = new Kolegij(req.body.kolegij);
    await kolegij.save();
    res.redirect(`/admin/kolegiji/${kolegij._id}`);
}));

//prikaz svih kolegija
router.get('/kolegiji', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegiji = await Kolegij.find({});
    res.render(`kolegiji/index`, { kolegiji });
}))

//forma za izradu novog kolegija
router.get('/kolegiji/new', isLoggedIn, isAdmin, (req, res) => {
    res.render(`kolegiji/new`);

})

//Prikaz stranice jednog kolegija
router.get('/kolegiji/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegij = await Kolegij.findById(req.params.id).populate('ispiti').populate('studenti');
    const studenti = await Student.find({}).populate('kolegiji');
    const neupisani = [{}]
    let pomocna = false;
    studenti.forEach(student => {
        pomocna = false;
        if (kolegij.studenti !== null) {
            kolegij.studenti.forEach(ks => {
                if (ks._id.equals(student._id)) pomocna = true;
            })
            if (!pomocna) neupisani.push(student);
        }
    })
    res.render(`kolegiji/show`, { kolegij, studenti, neupisani });



}));




//Prikaz stranice za uređivanje kolegija
router.get('/kolegiji/edit/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegij = await Kolegij.findById(req.params.id).populate('ispiti').populate('studenti');
    res.render('kolegiji/edit', { kolegij });


}))

//Forma za ažuriranje podataka o određenom kolegiju
router.put('/kolegiji/:id', isLoggedIn, isAdmin, provjeriKolegij, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const kolegij = await Kolegij.findByIdAndUpdate(id, { ...req.body.kolegij });
    res.redirect(`/admin/kolegiji/${kolegij._id}`);

}))

//dodavanje novog ispita za određeni kolegij
router.post('/kolegiji/:kolegijId/ispiti', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { naslov, datum } = req.body.ispit;
    const ispit = new Ispit({ naslov, datum, kolegij: req.params.kolegijId });
    await ispit.save();
    const kolegij = await Kolegij.findById(req.params.kolegijId);
    kolegij.ispiti.push(ispit._id);
    await kolegij.save();
    req.flash('success', 'Uspješno ste napravili novi ispit!');
    res.redirect(`/admin/kolegiji/${kolegij._id}`);


}));

//upisivanje studenta u kolegij
router.post('/kolegiji/:id/student', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegij = await Kolegij.findById(req.params.id);
    const student = await Student.findById(req.body.studentId);
    kolegij.studenti.push(student);
    student.kolegiji.push(kolegij);
    await kolegij.save();
    await student.save();
    req.flash('success', 'Student je uspješno upisan u kolegij!');
    res.redirect(`/admin/kolegiji/${kolegij._id}`);


}))

//Brisanje kolegija
router.delete('/kolegiji/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const kolegij = await Kolegij.findById(id).populate('studenti')
    console.log(kolegij.studenti.length)
    if (kolegij.ispiti) {
        kolegij.ispiti.forEach(async (ispit) => {
            await Ispit.findByIdAndDelete(ispit._id);
        })
    }
    if (kolegij.studenti.length === 0) {
        await Kolegij.findByIdAndDelete(id);
        req.flash('success', 'Uspješno brisanje kolegija!');
        res.redirect('/admin/kolegiji')
    } else {
        req.flash('error', 'Nije moguće obrisati kolegij koji ima upisane studente!');
        res.redirect('/admin/kolegiji')
    }



}))

//studentRoutes
//dohvat svih studenata
router.get('/studenti', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const studenti = await Student.find({}).populate('kolegiji');
    res.render('studenti/index', { studenti });


}))

//Forma za uređivanje podataka o studentu
/* router.get('/studenti/new', isLoggedIn, catchAsync(async (req, res) => {
    if (req.user.username === "admin") {
        const kolegiji = await Kolegij.find({});
        res.render('studenti/new', { kolegiji });
    } else {
        res.redirect('/student')
    }

})) */

//putanja za dodavanje novog studenta
router.post('/studenti', isLoggedIn, isAdmin, provjeriStudenta, catchAsync(async (req, res, next) => {
    const student = new Student(req.body.student);
    await student.save();
    req.flash('success', 'Uspješna izrada novog studenta!');
    res.redirect(`/admin/studenti/${student._id}`);


}))

//prikaz show stranice studenta
router.get('/studenti/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id).populate('kolegiji');
    res.render('studenti/show', { student });
}))

//prikaz edit stranice studenta
router.get('/studenti/edit/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const kolegiji = await Kolegij.find({});
    const student = await Student.findById(req.params.id).populate('kolegiji');
    res.render('studenti/edit', { student, kolegiji });


}))

//putanja koja obavlja proces spremanja novih vrijednosti za odredenog studenta
router.put('/studenti/:id', isLoggedIn, isAdmin, provjeriStudenta, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const student = await Student.findByIdAndUpdate(id, { ...req.body.student });
    student.kolegiji.push(req.body.kolegij);
    await student.save();
    req.flash('success', 'Uspješno uređivanje studenta!');
    res.redirect(`/admin/studenti/${student._id}`);


}))

//putanja za brisanje studenta
router.delete('/studenti/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id);


    if (student.kolegiji.length === 0) {
        await Student.findByIdAndDelete(id);
        req.flash('success', 'Uspješno ste obrisali studenta!');
        res.redirect('/admin/studenti')
    } else {
        req.flash('error', 'Nije moguće obrisati studenta upisanog na kolegij!');
        res.redirect('/admin/studenti')
    }



}))
router.get('/ispiti', isLoggedIn, isAdmin, async (req, res) => {
    const ispiti = await Ispit.find({}).populate('kolegij');
    res.render('ispiti/index', { ispiti })

})
router.get('/ispiti/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const ispit = await Ispit.findById(id).populate('kolegij').populate('rezultati');
    res.render('ispiti/show', { ispit })

})

//Ocjenjivanje prijavljenog ispita
router.post('/ispiti/:id/ocjeni/:idStudent', isLoggedIn, isAdmin, async (req, res) => {
    const { id, idStudent } = req.params;
    const ocjena = req.body.ocjena;
    const ispit = await Ispit.findById(id);
    const student = await Student.findById(idStudent);

    if (ispit.rezultati.length > 0) {
        for (let r of ispit.rezultati) {
            if (r.student.equals(idStudent)) {
                r.ocjena = ocjena;

            }
        }
    }
    await ispit.save()
    res.redirect(`/admin/ispiti/${id}`);

})

module.exports = router;