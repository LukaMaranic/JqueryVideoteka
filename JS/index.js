$(document).ready(function() {
            localStorage.removeItem("listaFilmova");
            $("#dodajFilmBtn").click(function() {
                var nazivFilma = $("#filmSelectorId option:selected").text();
                var cijenaFilma = $("#cijenaInput").val();
                if (nazivFilma == "Naziv Filma") {
                    alert("Niste odabrali film.");
                } else if (cijenaFilma <= 0) {
                    alert("Niti jedan film nije besplatan!");
                } else {
                    var listaFilmova = localStorage.getItem("listaFilmova");
                    if (listaFilmova == null) {
                        spremiFilm(1, nazivFilma, cijenaFilma, popuniTablicuFilmova);
                    } else {
                        listaFilmova = JSON.parse(listaFilmova);
                        spremiFilm((listaFilmova.filmovi.length + 1), nazivFilma, cijenaFilma, popuniTablicuFilmova);
                    }
                }
            });
            $("body").on("click", "#azurirajFilmBtn", function() {
                var id = $("#azurirajIdFilma").text();
                var cijenaFilma = $("#azurirajCijenaFilma").val();
                if (cijenaFilma <= 0) {
                    alert("Cijena mora biti veća od 0 HRK")
                } else {
                    azurirajFilm(id, cijenaFilma, popuniTablicuFilmova);
                }
            });

            $("body").on("click", "#azurirajBtn", function() {
                var id = ($(this)).parent().prev().prev().prev();
                $("#containerTablica").hide();
                $("#containerAzuriraj").show();
                dohvatiJedanFilmPoId(id.text(), function(id, nazivFilma, cijenaFilma) {
                    $("#azurirajIdFilma").text(id);
                    $("#azurirajNazivFilma").text(nazivFilma);
                    $("#azurirajCijenaFilma").val(cijenaFilma);
                });
            });
            $("body").on("click", "#natragBtn", function() {
                $("#containerAzuriraj").hide();
                $("#containerDetalji").hide();
                $("#containerTablica").show();

            });
            $("body").on("click", "#detaljiBtn", function() {
                var nazivFilma = ($(this)).parent().prev().prev();
                dohvatiAPI(nazivFilma.text());
            });
            $("body").on("click", "#obrisiBtn", function() {
                var id = ($(this)).parent().prev().prev().prev();
                izbrisiFilm(id.text(), popuniTablicuFilmova);
            });

            function izracunajPopust() {
                var listaFilmovaBezDuplikata = [];
                var listaFilmova = localStorage.getItem("listaFilmova");
                listaFilmova = JSON.parse(listaFilmova);
                var privremenaLista = [];
                var ukupnoZaPlatiti = 0;
                if (listaFilmova != null) {
                    for (var i = 0; i < listaFilmova.filmovi.length; i++) {
                        privremenaLista.push(listaFilmova.filmovi[i].nazivFilma);
                        ukupnoZaPlatiti += parseInt(listaFilmova.filmovi[i].cijenaFilma);
                    }
                    listaFilmovaBezDuplikata = privremenaLista.filter(function(elem, index, self) {
                        return index === self.indexOf(elem);
                    });
                } else {

                }

                var popust = 0;
                $("#cijenaFilmaId").empty();
                $("#cijenaFilmaId").append(ukupnoZaPlatiti.toFixed(2) + " HRK");
                if (listaFilmovaBezDuplikata.length >= 3) {
                    popust = ukupnoZaPlatiti * 0.05;
                    $("#popustFilmaId").empty();
                    $("#popustFilmaId").append(popust.toFixed(2) + " HRK");
                } else {
                    $("#popustFilmaId").text("0.00 HRK");
                }
                var ukupnoZaPlatitiSaPopustom = ukupnoZaPlatiti - popust;
                $("#ukupnoZaPlatitiId").empty();
                $("#ukupnoZaPlatitiId").append(ukupnoZaPlatitiSaPopustom.toFixed(2) + " HRK");
            }

            function spremiFilm(id, nazivFilma, cijenaFilma, callback) { // prilikom svakog dodavanja filma u tablicu, spremamo podatke o tom filmu
                var filmZaSpremiti = localStorage.getItem("listaFilmova");
                if (filmZaSpremiti == null) { //ako lista ne postoji
                    filmZaSpremiti = "{\"filmovi\":[{\"id\":\"" + id + "\",\"nazivFilma\":\"" + nazivFilma + "\",\"cijenaFilma\":" + cijenaFilma + "}]}";
                    localStorage.setItem("listaFilmova", filmZaSpremiti);
                } else { // ako lista vec postoji
                    filmZaSpremiti = filmZaSpremiti.replace("]}", ",");
                    filmZaSpremiti += "{\"id\":\"" + id + "\",\"nazivFilma\":\"" + nazivFilma + "\", \"cijenaFilma\":" + cijenaFilma + "}]}";
                    localStorage.setItem("listaFilmova", filmZaSpremiti);
                }
                callback();
            }

            function izbrisiFilm(id, callback) {

                $("#filmTable").empty();
                var noviId = 1;
                var listaFilmova = localStorage.getItem("listaFilmova");
                listaFilmova = JSON.parse(listaFilmova);
                var noviJSON = "{\"filmovi\":[";
                for (var i = 0; i < listaFilmova.filmovi.length; i++) {
                    if (listaFilmova.filmovi[i].id != id) { //stvaramo novi JSON za localstorage bez onog kojeg brišemo
                        noviJSON += "{\"id\":\"" + (noviId) + "\",\"nazivFilma\":\"" + listaFilmova.filmovi[i].nazivFilma + "\", \"cijenaFilma\":" + listaFilmova.filmovi[i].cijenaFilma + "},"
                        noviId++;
                    }
                }
                noviJSON = noviJSON.slice(0, -1);
                noviJSON += "]}";
                localStorage.removeItem("listaFilmova");
                if (noviJSON.length > 15) {
                    localStorage.setItem("listaFilmova", noviJSON);
                }
                callback();
            }

            function popuniTablicuFilmova() {
                $("#filmTable").empty();
                var listaFilmova = localStorage.getItem("listaFilmova");
                listaFilmova = JSON.parse(listaFilmova);
                if (listaFilmova != null) {
                    for (var i = 0; i < listaFilmova.filmovi.length; i++) {
                        $("#filmTable").append("<tr><th scope='row'>" + (i + 1) + "</th><td>" + listaFilmova.filmovi[i].nazivFilma + "</td><td>" + listaFilmova.filmovi[i].cijenaFilma + "</td><td><button id=\"detaljiBtn\" class=\"btn btn-info\">Detalji</button> <button id=\"azurirajBtn\" type=\"button\" class=\"btn btn-warning\">Ažuriraj</button> <button id=\"obrisiBtn\"  class=\"btn btn-danger\">Obriši</button></td></tr>");
                    }
                }
                izracunajPopust();
            }

            function dohvatiAPI(nazivFilma) {
                $.ajax({
                    url: "https://www.omdbapi.com/?t=" + nazivFilma + "&apikey=7e81ab4f",
                    success: function(data) {
                        $("#detaljiNaziv").text(nazivFilma);
                        $("#detaljiGodina").text(data.Year);
                        $("#detaljiTrajanje").text(data.Runtime);
                        $("#detaljiZanr").text(data.Genre);
                        $("#detaljiRedatelj").text(data.Director);
                        $("#detaljiGlumci").text(data.Actors);
                        $("#containerTablica").hide();
                        $("#containerDetalji").show();
                    },
                    error: function(xhr) {
                        console.log(xhr);
                    }
                });
            }

            function dohvatiJedanFilmPoId(id, callback) {
                var listaFilmova = localStorage.getItem("listaFilmova");
                listaFilmova = JSON.parse(listaFilmova);
                for (var i = 0; i < listaFilmova.filmovi.length; i++) {
                    if (listaFilmova.filmovi[i].id == id) {
                        callback(listaFilmova.filmovi[i].id, listaFilmova.filmovi[i].nazivFilma, listaFilmova.filmovi[i].cijenaFilma);
                    }
                }
            }

            function azurirajFilm(id, cijenaFilma, callback) {
                var listaFilmova = localStorage.getItem("listaFilmova");
                listaFilmova = JSON.parse(listaFilmova);
                for (var i = 0; i < listaFilmova.filmovi.length; i++) {
                    if (listaFilmova.filmovi[i].id == id) {
                        listaFilmova.filmovi[i].cijenaFilma = cijenaFilma;
                    }
                }
                localStorage.removeItem("listaFilmova");
                localStorage.setItem("listaFilmova", JSON.stringify(listaFilmova));
                callback();
                alert("Film uspješno ažuriran");
            }

        });