import 'package:app/ricerca.dart';
import 'package:app/top_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:async/async.dart';

class PaginaPrincipale extends StatefulWidget {
  @override
  PaginaPrincipaleState createState() => PaginaPrincipaleState();
}

class PaginaPrincipaleState extends State<PaginaPrincipale> {
  String valoreRicerca = '';
  final Firestore firestore = Firestore.instance;
  Stream orari;

  @override
  void initState() {
    super.initState();

    orari = recuperaOrari();
  }

  @override
  Widget build(BuildContext context) {
    double altezzaStatusBar = MediaQuery.of(context).padding.top;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(64.0 + altezzaStatusBar),
        child: TopBar(onCerca: (valore) => setState(() => valoreRicerca = valore))
      ),
      body: SafeArea(
        child: (valoreRicerca.isEmpty ?
          Text('Preferiti') :
          Ricerca(valoreRicerca, orari)
        )
      ),
    );
  }

  Stream recuperaOrari() {
    return StreamZip([
      firestore.collection('Classi').snapshots().map((list) => list.documents.map((doc) {
        doc.data['tipo'] = 'Classe';
        return doc.data;
      })),
      firestore.collection('Aule').snapshots().map((list) => list.documents.map((doc) {
        doc.data['tipo'] = 'Aula';
        return doc.data;
      })),
      firestore.collection('Professori').snapshots().map((list) => list.documents.map((doc) {
        doc.data['tipo'] = 'Professore';
        return doc.data;
      })),
    ]).map((dati) {
      return([dati[0], dati[1], dati[2]].expand((x) => x));
    });
  }
}