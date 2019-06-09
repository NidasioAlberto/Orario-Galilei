import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class PaginaPrincipale extends StatefulWidget {
  @override
  PaginaPrincipaleState createState() => PaginaPrincipaleState();
}

class PaginaPrincipaleState extends State<PaginaPrincipale> {
  @override
  void initState() {
    super.initState();

    //Recupero le collection dal database
    Stream classi = Firestore.instance
      .collection('Classi')
      .snapshots()
      .map((querySnap) => querySnap.documents
        .map((documentSnap) {
          //Recupero i dati del documento
          Map<String, dynamic> documentData = documentSnap.data;

          //Aggiungo l'id del documento ai dati
          documentData['id'] = documentSnap.documentID;

          return documentData;
        })
      );
  }

  @override
  Widget build(BuildContext context) {
    return null;
  }
}