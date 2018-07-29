const express = require('express');
const router = express.Router();

////// ERROR ROUTE ////
router.get('/error', (req, res) => {
    res.send("<h3>An error has occurred. Please contact the administrator.</h3>");
});

////// 404 (Wildcard) ROUTE //////
router.get('*', (req, res) => {
    res.send("<h1>404 - Wrong Page</h1>");
});

module.exports = router;
