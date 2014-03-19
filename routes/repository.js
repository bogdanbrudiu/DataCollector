var mongo = require('mongodb');

var Server = mongo.Server,
    Db=  mongo.Db,
    BSON = mongo.BSONPure;


 var mongodb_host = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
 var mongodb_port = parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT) || 27017;
 var mongodb_db = process.env.OPENSHIFT_APP_NAME || 'dataCollector';
 var mongodb_user = process.env.OPENSHIFT_MONGODB_DB_USERNAME;// || 'admin';
 var mongodb_pass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;// || 'xvuefKLK7Nha';


var server = new Server(mongodb_host, mongodb_port);

var db = new Db(mongodb_db, server, {safe: true});
db.open(function (err, db) {
    if (!err) {
        console.log("Connected to '"+mongodb_db+"' database");

	if(mongodb_user != "" && mongodb_user != null){

	db.authenticate(mongodb_user, mongodb_pass,function(err, res) {
        		if(!err) {
                		console.log("Authenticated");

       			 	db.collection('users', { safe: true }, function (err, collection) {
            				if (err) {
                				console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                				populateUsers();
            				}
        			});
        			db.collection('metadata', { safe: true }, function (err, collection) {
           				if (err) {
               	 				console.log("The 'metadata' collection doesn't exist. Creating it with sample data...");
                				populateMetadata();
        				}
       				});
            		} else {
                		console.log("Error in authentication.");
        	        	console.log(err);
	        	}
		});
	}else{
     			 	db.collection('users', { safe: true }, function (err, collection) {
            				if (err) {
                				console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                				populateUsers();
            				}
        			});
        			db.collection('metadata', { safe: true }, function (err, collection) {
           				if (err) {
               	 				console.log("The 'metadata' collection doesn't exist. Creating it with sample data...");
                				populateMetadata();
        				}
       				});
   
	}

    }else{
	console.log("Db open error: "+err);
	}
});
exports.db=db;
exports.apilogin = function (username, password, callbackResult) {
   
    console.log('API Login:[' + username + ']->[' + password + ']');
    db.collection('users', function (err, collection) {
        collection.findOne({ 'username': username, 'password': password }, function (err, item) {
            if (err) {
                console.log('Error:'+err);
                    callbackResult(false);
            } else {
                if (item != undefined) {
                    console.log('Success: ' + JSON.stringify(item));
                    callbackResult(item);
                } else {
                    console.log('Not found!');
                    callbackResult(false);
                }
            }
        });
    });
};
exports.login = function (req, res) {
    var username = req.body.email;
    var password = req.body.password;
    console.log('Login:[' + username + ']->[' + password + ']');
    db.collection('users', function (err, collection) {
        collection.findOne({ 'username': username, 'password': password }, function (err, item) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                if (item != undefined) {
                    console.log('Success: ' + JSON.stringify(item));
                    res.send(item);
                } else {
                    console.log('Not found!');
                    res.send({ 'error': 'Fail' });
                }
            }
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving entry: ' + id);
    req.collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
        if (err) {
            res.send({ 'error': 'An error has occurred' });
        } else {
            console.log('Success: ' + JSON.stringify(item));
            res.send(item);
        }
        });
}; 

exports.getEntries = function (req, res) {
    var modifiedSince = req.query["modifiedSince"];
    console.log('Get entries modifiedSince: ' + modifiedSince+' owner: '+req.user.owner+req.user.username+'/');
    if (modifiedSince) {
        if (modifiedSince == 'null') {
            modifiedSince = new Date(1000, 01, 01);
        } else {
            modifiedSince = new Date(modifiedSince);
        }
        console.log('Getting entries with lastModified > ' + modifiedSince.toISOString());
	      	
		req.collection.find(
		{ 
			"lastModified": { $gt: modifiedSince}, 
			"owner": { $regex: req.user.owner+req.user.username+'/'+'.*', $options: 'i' }
		}, { limit: 10, sort: [['_id', -1]] }).toArray(function (err, items) {
            		res.jsonp(items);
        	});
    } else {
        console.log('Get all entries');
        req.collection.find({}, { limit: 10, sort: [['_id', -1]] }).toArray(function (err, items) {
            res.jsonp(items);
        });
    }


   
};
exports.addEntry = function (req, res) {
	


    var entry = req.body;
    entry.lastModified = new Date();
    entry.owner=req.user.owner+req.user.username+'/';
    console.log('Adding: ' + JSON.stringify(entry));

    req.collection.insert(entry, {}, function (err, results) {
        if (err) {
            res.send({ 'error': 'An error has occurred' });
        } else {
            console.log('Success: ' + JSON.stringify(results[0]));
            res.send(results[0]);
        }
    })
};
exports.updateEntry = function (req, res) {
    var id = req.params.id;
    var entry = req.body;
 console.log('Updating: ' + JSON.stringify(entry));

/*
	if(entry.owner.lastIndexOf(req.user.owner+req.user.username+'/', 0) !== 0)
	{
		console.log('Ownership issues! Owner:'+entry.owner+' Trespasser:'+req.user.owner+req.user.username+'/'+' '+entry.owner.lastIndexOf(req.user.owner+req.user.username+'/', 0));
		res.send({ 'error': 'Ownership issues!' });
	}
*/

    entry.lastModified = new Date();
    delete entry._id;

    console.log(JSON.stringify(entry));
    req.collection.update({ _id: new BSON.ObjectID(req.params.id), "owner": { $regex: req.user.owner+req.user.username+'/'+'.*', $options: 'i' } }, { $set: entry }, { safe: true, multi: false }, function (err, result) {
        if (err) {
            console.log('Error updating: ' + err);
            res.send({ 'error': 'An error has occurred' });
        } else {
            console.log('' + result + ' document(s) updated');
            entry._id = id;
            res.send(entry);
        }
    })
};





/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateUsers = function() {
 
    console.log("Populating users Collection database...");
    var users = [
        { "owner":"/",  "username": "admin", "password": "admin", "isAdmin": true, "lastModified": new Date(), "deleted": false },
        { "owner":"/admin/", "username": "user1", "password": "user1", "isAdmin": false, "metadata": "ed1", "lastModified": new Date(), "deleted": false },
        { "owner":"/admin/", "username": "user2", "password": "user2", "isAdmin": false, "metadata": "ed2", "lastModified": new Date(), "deleted": false },
        { "owner":"/admin/", "username": "ExitPoll", "password": "ExitPoll", "isAdmin": true, "metadata": "ExitPoll", "lastModified": new Date(), "deleted": false }, 
	{ "owner":"/admin/ExitPoll/", "username": "ExitPollUser1", "password": "ExitPollUser1", "isAdmin": false, "metadata": "ExitPoll", "lastModified": new Date(), "deleted": false }

    ];
 
    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
 
};
var populateMetadata = function() {
    console.log("Populating metadata Collection database...");
    var entries = [
	{
	"owner":"/admin/", 
	"name": "name", "schema": '\
{  "_id": {\
    "type": "Text",\
    "editorAttrs": {\
      "disabled": true\
}\
    },\
    "TipVanzareVoce": {\
        "title": "Tip Vanzare Voce",\
        "description": "In cazul in care faceti migrare de la Voce 0 la voce cu minute alegeti \'UPSELL\'",\
        "type": "Radio",\
        "options": [\
          "INSTALARE",\
          "MIGRARE",\
          "UPSELL"\
        ]\
    },\
  "Voce": {\
      "title": "Voce",\
      "description": "Tipul Abonamentului",\
      "type": "Radio",\
      "options": [\
        "Voce 0",\
        "Voce Nelimitat 100",\
        "Voce Nelimitat 200",\
        "Voce Nelimitat 400"\
      ]\
  },\
  "TipVanzareDate": {\
      "title": "Tip Vanzare Date",\
      "description": "In cazul migrari de la Clicknet suport la Internet platit alegeti \'UPSELL\'",\
      "type": "Radio",\
      "options": [\
        "INSTALARE",\
        "MIGRARE",\
        "UPSELL"\
      ]\
  },\
  "Date": {\
      "title": "Date",\
      "description": "Tipul Abonamentului",\
      "type": "Radio",\
      "options": [\
        "Surf",\
        "Play",\
        "Power"\
      ]\
  },\
  "TipVanzareCATV": {\
      "title": "TipVanzareCATV",\
      "description": "",\
      "type": "Radio",\
      "options": [\
        "INSTALARE",\
        "MIGRARE"\
      ]\
  },\
  "CATV": {\
      "title": "CATV",\
      "description": "",\
      "type": "Checkboxes",\
      "options": [\
        "CATV"\
      ]\
  },\
  "TipVanzareDTH": {\
      "title": "TipVanzareDTH",\
      "description": "",\
      "type": "Radio",\
      "options": [\
        "INSTALARE",\
        "MIGRARE"\
      ]\
  },\
  "DTH": {\
      "title": "DTH",\
      "description": "Tipul Abonamentului",\
      "type": "Radio",\
      "options": [\
        "Variat",\
        "Extra",\
        "Maxim"\
      ]\
  },\
  "NRSTBDTH": {\
      "title": "NR STB DTH",\
      "description": "",\
      "type": "Checkboxes",\
      "options": [\
        "1 SD",\
        "2 SD",\
        "3 SD",\
        "4 SD",\
        "1 HD",\
        "2 HD",\
        "3 HD",\
        "4 HD"\
      ]\
  },\
  "TipVanzareIPTV": {\
      "title": "TipVanzareIPTV",\
      "description": "",\
      "type": "Radio",\
      "options": [\
        "INSTALARE",\
        "MIGRARE"\
      ]\
  },\
  "IPTV": {\
      "title": "IPTV",\
      "description": "Tipul Abonamentului",\
      "type": "Radio",\
      "options": [\
        "I Variat",\
        "I Extra",\
        "I Maxim"\
      ]\
  },\
  "STBIPTV": {\
      "title": "STBIPTV",\
      "description": "",\
      "type": "Checkboxes",\
      "options": [\
        "1 STANDARD",\
        "2 STANDARD",\
        "3 STANDARD",\
        "4 STANDARD",\
        "1 PVR",\
        "2 PVR",\
        "3 PVR",\
        "4 PVR"\
      ]\
  },\
  "Pachete": {\
      "title": "Pachet Suplimentar si optiuni suplimentare",\
      "description": "",\
      "type": "Checkboxes",\
      "options": [\
        "DOLCE HD",\
        "MAXPACK",\
        "HBO GO",\
        "VOYO",\
        "ANTIVIRUS",\
        "Reducere 2 Euro",\
        "Tableta (pachetul cu tableta)",\
        "Oferta Catv Free"\
      ]\
  },\
  "ProduseCOSMOTE": {\
      "title": "Produse COSMOTE",\
      "description": "",\
      "type": "Checkboxes",\
      "options": [\
        "Cosmote 5000+",\
        "Internet TO GO"\
      ]\
  },\
  "PACHET3PCATV": {\
      "title": "PACHET 3P + CATV ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 400 [19 Euro fara TVA, 23.56 Euro cu TVA 95 lei in primele 3 luni 106 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 200 [18 Euro fara TVA, 22.32 Euro cu TVA 89 lei in primele 3 luni 100 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 100 [17 Euro fara TVA, 21.08 Euro cu TVA 84 lei in primele 3 luni 95 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 400 [18 Euro fara TVA, 22.32 Euro cu TVA 89 lei in primele 3 luni 100 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 200 [17 Euro fara TVA, 21.08 Euro cu TVA 84 lei in primele 3 luni 95 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 100 [16 Euro fara TVA,19.84 Euro cu TVA 78 lei in primele 3 luni 89 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 400 [17 Euro fara TVA, 21.08 Euro cu TVA 84 lei in primele 3 luni 95 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 200 [16 Euro fara TVA, 19.84 Euro cu TVA 78 lei in primele 3 luni 89 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 100 [15 Euro fara TVA, 18.60 Euro cu TVA 73 lei in primele 3 luni 84 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 14.15 Euro fara TVA,17.55 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 79 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 12.35 Euro fara TVA,15.31 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 69 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 10.55 Euro fara TVA,13.08 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 59 lei in ultimele 21 luni]"\
      ]\
  },\
  "PACHET3PTVA": {\
      "title": "PACHET 3P CU TV ANALOG (CATV) ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 400 [15 Euro fara TVA, 18.60 Euro cu TVA 73 lei in primele 3 luni 84 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 200 [13.5 Euro fara TVA,16.74 Euro cu TVA 64 lei in primele 3 luni 75 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 100 [12 Euro fara TVA,14.88 Euro cu TVA 56 lei in primele 3 luni 67 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 8.75 Euro fara TVA,10.85 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 49 lei in ultimele 21 luni]"\
      ]\
  },\
  "PACHET3PTVD": {\
      "title": "PACHET 3P CU TV DIGITAL  ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 400 [19 Euro fara TVA, 23.56 Euro cu TVA 96 lei in primele 3 luni 107 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 200 [18 Euro fara TVA, 22.32 Euro cu TVA 90 lei in primele 3 luni 101 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce Nelimitat 100 [17 Euro fara TVA, 21.08 Euro cu TVA 85 lei in primele 3 luni 96 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 400 [18 Euro fara TVA, 22.32 Euro cu TVA 90 lei in primele 3 luni 101 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 200 [17 Euro fara TVA, 21.08 Euro cu TVA 85 lei in primele 3 luni 96 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce Nelimitat 100 [16 Euro fara TVA,19.84 Euro cu TVA 79 lei in primele 3 luni 90 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 400 [17 Euro fara TVA, 21.08 Euro cu TVA 85 lei in primele 3 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 200 [16 Euro fara TVA, 19.84 Euro cu TVA 79 lei in primele 3 luni 96 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce Nelimitat 100 [15 Euro fara TVA, 18.60 Euro cu TVA 73 lei in primele 3 luni 84 lei in ultimele 21 luni]",\
        "TV Maxim + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 14.15 Euro fara TVA,17.55 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 79 lei in ultimele 21 luni]",\
        "TV Extra + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 12.35 Euro fara TVA,15.31 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 69 lei in ultimele 21 luni]",\
        "TV Variat + Net 100Mbps + Voce fara minute [6.95 Euro fara TVA, 8.62 Euro cu TVA in primele 3 luni si 10.55 Euro fara TVA,13.08 Euro cu TVA in ultimele 21 luni 39 lei in primele 3 luni 59 lei in ultimele 21 luni]"\
      ]\
  },\
  "PACHET2PTVA": {\
      "title": "PACHET 2P CU TV ANALOG (CATV) ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Variat + Voce Nelimitat 400 [10.3 Euro fara TVA,12.78 Euro cu TVA 58 lei]",\
        "TV Variat + Voce Nelimitat 200 [8.5 Euro fara TVA,10.54 Euro cu TVA 47 lei]",\
        "TV Variat + Voce Nelimitat 100 [8 Euro fara TVA, 9.92 Euro cu TVA 45 lei]"\
      ]\
  },\
  "PACHET2PTVD": {\
      "title": "PACHET 2P CU TV DIGITAL ( DTH SAU IPTV) ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Maxim + Voce Nelimitat 400 [16 euro FARA TVA, 19.84 Euro cu TVA 89 RON]",\
        "TV Extra + Voce Nelimitat 400 [14.5 euro TVA, 17.98 euro cu TVA 81 RON]",\
        "TV Maxim + Voce Nelimitat 200 [14.5 euro fara tva, 17.98 euro cu TVA 81 RON]",\
        "TV Extra + Voce Nelimitat 200 [13 euro fara tva , 16.12 euro cu tva 73 RON]",\
        "TV Maxim + Voce Nelimitat 100 [13 euro fara tva , 16.12 euro cu tva 73 RON]",\
        "TV Extra + Voce Nelimitat 100 [11.5 euro fara TVA , 14,26 euro cu TVA 64 RON]",\
        "TV Variat + Voce Nelimitat 100 [10 Euro fara TVA , 12,4 euro cu TVA 56 RON ]"\
      ]\
  },\
  "PACHET2P": {\
      "title": "PACHET 2P ( FARA TV) ",\
      "type": "Select",\
      "options": [\
        "",\
        "Net 100Mbps + Voce Nelimitat 400 [15 Euro fara TVA, 18.06 Euro cu TVA 85 lei]",\
        "Net 100Mbps + Voce Nelimitat 200 [13.5 Euro fara TVA, 16.74 Euro cu TVA 76 lei ]",\
        "Net 100Mbps + Voce Nelimitat 100 [12 Euro fara TVA, 14.88 Euro cu TVA 68 lei]",\
        "Net 100Mbps + Voce fara minute [6.5 Euro fara TVA, 8.1 Euro cu TVA 36 lei]"\
      ]\
  },\
  "PACHETIPCATV": {\
      "title": "PACHET 1P CATV  ",\
      "type": "Select",\
      "options": [\
        "",\
        "TV Variat - CATV - 19 RON "\
      ]\
  },\
  "NumeClient": {\
      "title": "Nume CLIENT  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Text"\
  },\
  "CNP": {\
      "title": "CNP ",\
      "type": "Text"\
  },\
  "CI": {\
      "title": "CI (NR si SERIE) ",\
      "type": "Text"\
  },\
  "TelContact": {\
      "title": "Tel Contact  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Text"\
  },\
  "NrFix": {\
      "title": "NR tel FIX ",\
      "type": "Text"\
  },\
  "AdresaInstalare": {\
      "title": "ADRESA INSTALARE  *",\
      "validators": [\
        "required"\
      ],\
      "type": "TextArea"\
  },\
  "Datavanzare": {\
      "title": "Data vazare  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Date"\
  },\
  "ProiectVanzare": {\
      "title": "Proiect Vanzare  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Radio",\
      "options": [\
        " BERCENI ",\
        " FOOTPRINT VECHI "\
      ]\
  },\
  "NumeEchipa": {\
      "title": "NUME ECHIPA  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Select",\
      "options": [\
        "",\
        "Alexandru Pana",\
        "Marius Ciurduc",\
        "Tincu Vlad",\
        "Ghita Mihalache",\
        "Raul Moldovan",\
        "Andrei Ghiciusca",\
        "Andrei Boitos",\
        "Marin Marius",\
        "Alexandra Gheorgheasa",\
        "Iulia Mazilu"\
      ]\
  },\
  "NumeAgent": {\
      "title": "Nume Agent  *",\
      "validators": [\
        "required"\
      ],\
      "type": "Select",\
      "options": [\
        "",\
        "BADEA STEFAN-MARIAN",\
        "BRATU IONELA-FLORENTINA",\
        "BROJBOIU ANCA-ALEXANDRA",\
        "CHEOSOIU MIHAI-IULIAN",\
        "DEACONU OVIDIU-GEORGIAN",\
        "GEORGESCU MIHAI",\
        "IORDACHE VICTOR-SEBASTIAN",\
        "MARINESCU VASILE",\
        "PARPALA DORIN-MIRCEA",\
        "SERCAU ANCA",\
        "SESCU STEFAN-MARIUS",\
        "DINCA CRISTIAN-CORNEL",\
        "MORCOV VIOREL-MARIAN",\
        "PANA MARIA DIANA",\
        "MARCU EDGAR",\
        "GUTA STEFANIA",\
        "LAZAR MARINELA DANIELA",\
        "Stancu Constanta",\
        "Sofia Marius Catalin",\
        "Tanase Iulia",\
        "Popescu Daniel",\
        "Cosovan Stefan",\
        "Fluturu Ana Maria",\
        "Paun Nicolae",\
        "Alancuti Nicusor ",\
        "Vantdevara Petrut",\
        "Gavrilita Inna",\
        "Miulescu Alexandru",\
        "Niculae Andrei",\
        "Mesina Daniela",\
        "Arion Razvan",\
        "Puscaciu Mihai",\
        "Vasile Mihaela",\
        "Porojan Alexandru",\
        "BARBUCEANU MIHAIL-SORIN",\
        "CHIRIAC COSMIN-CATALIN",\
        "DRAGOMIR DANIELA",\
        "FATU RAZVAN-ION",\
        "IFRIM CATALINA",\
        "PASCU ANA-MARIA",\
        "POPESCU FLORIAN-GABRIEL-EUGEN",\
        "RUSU MONICA-ALEXANDRA",\
        "STANCIU MARIAN-EUGEN",\
        "AXINTE MARIUS",\
        "POPA GEORGE MARIAN",\
        "MUNTEANU CRISTINA",\
        "MANCIU NICOLAE",\
        "RALUCA CHELARU",\
        "ANCA BORSERI",\
        "IRIS PLOPEANU",\
        "MIHAILA TEODORA CRISTIANA",\
        "GOLEA OCTAVIAN DRAGOS",\
        "MINEA CONSTANTIN COSMIN",\
        "SZECHEL ANCA-VIRGINIA",\
        "GHITA MARINICA IONUT",\
        "MARIN IONELA IULIA",\
        "PATRASCU MADALIN",\
        "PREDA CRISTIAN MARIUS",\
        "BERCA ROBERT STEFAN",\
        "POPESCU ADRIAN ROBERTO",\
        "BEJGU GHEORGHITA",\
        "HURDUZEA ALEXANDRU",\
        "OLTEANU DRAGOS",\
        "PROFIR ALEXANDRU",\
        "VARZARU MARIANA-CRISTINA",\
        "TUDORAN CAMELIA",\
        "TOROMAN DANIEL-STELIAN",\
        "SUTA ROBERT",\
        "STANCIU MARIA-CRISTINA",\
        "NITA GHEORGHE",\
        "DONICA LEONIDE-ALIN",\
        "DINU NICU-DANIEL",\
        "DIMA ALEXANDRU",\
        "BARBACEANU PAULA-GENIOARA",\
        "DINCA VASILE-ALEXANDRU",\
        "MARIN DANIELA-ADRIANA",\
        "POPA DENISS",\
        "GAMAN COSMINA-IULIANA",\
        "PARAIPAN SIMONA-GEANINA",\
        "PARMAC ROXANA-GEORGIANA",\
        "TIRLA MADALINA-DENISA",\
        "NISTOR ADRIAN",\
        "SERBAN PATRICIA-CARLA-NICOLETA",\
        "DUMITRASCU ANDREEA DENISA",\
        "MANOLE ALEXANDRU",\
        "OZDEMIR GOZDE GEORGIANA",\
        "ALBEI FLORIN",\
        "CALINESCU ALEXANDRU-DANUT",\
        "CIUCIU ANDREI-PETRE",\
        "DUINEA MARIUS",\
        "OPRITA SERGIU-ANDREI",\
        "PLATON OVIDIU",\
        "VIERU ALEXANDRU",\
        "RAICU MARIAN",\
        "MIHAI CRISTIAN-FLORIN",\
        "CEUCA ANA",\
        "BIRA CRISTIAN",\
        "DABU DENISA",\
        "DRAGUSIN CLAUDIU",\
        "STOIAN ALIN",\
        "GATEA RAZVAN",\
        "PASCU DAN LAURENTIU",\
        "ANASTASIU HORIA-SERBAN",\
        "BARBU CATALIN",\
        "GHEORGHE MADALINA-ALEXANDRA",\
        "CORCIOVEI STEFAN COSTEL",\
        "BOITOS ANDREI-IULIAN",\
        "POPESCU BOGDAN NICOLAE",\
        "NEBUNU MIHAI FLORIN",\
        "DINU CATALIN ANDREI",\
        "UNGUREANU MIHAI",\
        "ADRIAN IONUT",\
        "NEDELCU ROXIN",\
        "CRISAN FLORIN",\
        "PETRE STEFAN",\
        "DRAGANUS MIRCEA NICOLAE",\
        "SOIT COSMIN",\
        "JILAVU ELENA",\
        "LUCIAN BUCICA",\
        "DANI PRODAN",\
        "PATRU CLAUDIU",\
        "NEAGU ALEXANDRA",\
        "BERCIU SILVIU",\
        "Sucea Alexandru",\
        "STANESCU CATALIN",\
        "BIRA MIRCEA",\
        "ZAMFIR ANDREI",\
        "CLAUDIU CIRUDUC",\
        "SAVA NICOLAE VALENTIN",\
        "ION FLAVIUS MIHAI"\
      ]\
  },\
  "Observatii": {\
      "title": "Observatii (agent) ",\
      "type": "TextArea"\
  }\
}', "lastModified": new Date(), "deleted": false
        },
	{
	"owner":"/admin/", 
        "name": "ed1", "schema": '\
{\
    "_id":{"type":"Text","editorAttrs":{"disabled":true}},\
    "col1":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "col2":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "col3":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "lastModified":{"type":"Text","editorAttrs":{"disabled":true}}\
}', "lastModified": new Date(), "deleted": false
        },
	{
	"owner":"/admin/", 
	"name": "ed2", "schema": '\
{\
    "_id":{"type":"Text","editorAttrs":{"disabled":true}},\
    "col_1":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "col_2":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "col_3":{"type":"Text","validators":["required"], "showInTable":"true"},\
    "lastModified":{"type":"Text","editorAttrs":{"disabled":true}}\
}', "lastModified": new Date(), "deleted": false
        },
        {
	"owner":"/admin/ExitPoll/", 
        "name": "ExitPoll", "schema": '\
{\
    "_id":{"type":"Text","editorAttrs":{"disabled":true}},\
    "Sex":{ "type": "Radio",\
        "options": [\
        "Masculin",\
        "Feminin"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
    "Varsta":{"type": "Radio",\
        "options": [\
        "18-29",\
        "30-44",\
        "45-64",\
        "65+"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
    "Mediul":{ "type": "Select",\
        "options": [\
        "Urban",\
        "Rural"\
      ]\,"validators":["required"], "showInTable":"true"},\
    "Studii":{"type": "Radio",\
        "options": [\
        "Fara",\
        "Primare",\
        "Medii",\
        "Superioare"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
     "Venit":{"type": "Radio",\
        "options": [\
        "<2000",\
        "2000-3999",\
        "4000-8000",\
        ">8000"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
      "Stare civila":{"type": "Checkboxes",\
        "options": [\
        "Casatorit"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
    "Vot":{"type": "Radio",\
        "options": [\
        "Varianta 1",\
        "Varianta 2",\
        "Varianta 3"\
      ]\
      ,"validators":["required"], "showInTable":"true"},\
    "lastModified":{"type":"Text","editorAttrs":{"disabled":true}}\
}', "lastModified": new Date(), "deleted": false
         }
    ];

    db.collection('metadata', function (err, collection) {
        collection.insert(entries, { safe: true }, function (err, result) { });
    });


  
 
};


