import 'package:app/preferiti.dart';
import 'package:app/ricerca.dart';
import 'package:app/top_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:async/async.dart';

class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Orari Galilei',
      home: AppScaffold()
    );
  }
}

class AppScaffold extends StatefulWidget {
  @override
  AppScaffoldState createState() => AppScaffoldState();
}

class AppScaffoldState extends State<AppScaffold> {
  String valoreRicerca = '';
  final Firestore firestore = Firestore.instance;

  Stream classi, aule, professori, tutto;

  @override
  void initState() {
    super.initState();

    classi = firestore.collection('Classi').snapshots().map((list) => list.documents.map((doc) => doc.data));
    aule = firestore.collection('Aule').snapshots().map((list) => list.documents.map((doc) => doc.data));
    professori = firestore.collection('Professori').snapshots().map((list) => list.documents.map((doc) => doc.data));

    tutto = StreamZip([classi, aule, professori]).map((dati) {
      return([dati[0], dati[1], dati[2]].expand((x) => x));
    }).map((dati) => dati.map((elemento) {
        String nomeClasse = elemento['classe'];
        String nomeAula = elemento['aula'];
        String nomeProf = elemento['professore'];
        if(nomeClasse != null) {
          elemento['id'] = nomeClasse;
        }
        else if(nomeAula != null) {
          elemento['id'] = nomeAula;
        }
        else if(nomeProf != null) {
          elemento['id'] = nomeProf;
        }
        return elemento;
      })
    );
  }

  @override
  Widget build(BuildContext context) {
    double altezzaStatusBar = MediaQuery.of(context).padding.top;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(64.0 + altezzaStatusBar),
        child: TopBar(onCerca: (valore) => setState(() {
            valoreRicerca = valore;
          })
        ),
      ),
      body: SafeArea(
        child: StreamBuilder(
          stream: tutto,
          initialData: [],
          builder: (context, AsyncSnapshot snap) { 
            List dati = snap.data.toList();

            return (valoreRicerca.isEmpty ?
              //Mostro la pagina dei preferiti
              Preferiti(dati) :
              //Mostro la pagina di ricerca
              Ricerca(valoreRicerca: valoreRicerca, dati: dati)
            );
          }
        )
      ),
    );
  }
}