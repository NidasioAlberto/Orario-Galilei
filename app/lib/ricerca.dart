import 'package:app/elemento_lista.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class Ricerca extends StatelessWidget {
  final String valoreRicerca;

  Ricerca(this.valoreRicerca) {
    dati = dati.where((elemento) {
      RegExp regExp = RegExp(valoreRicerca, caseSensitive: false);

      String nomeClasse = elemento['classe'];
      String nomeAula = elemento['aula'];
      String nomeProf = elemento['professore'];
      if(nomeClasse != null) {
        return regExp.hasMatch(nomeClasse);
      }
      else if(nomeAula != null) {
        return regExp.hasMatch(nomeAula);
      }
      else if(nomeProf != null) {
        return regExp.hasMatch(nomeProf);
      }
      else return false;
    }).toList();


  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: dati.length,
      itemBuilder: (context, position) {
        return ElementoLista(dati[position]);
      },
    );
  }

  ricerca(String _valoreRicerca) {
  }

  ricercaClassi(String _valoreRicerca) {
    //Cerco tra le classi
    Firestore.instance.collection('Classi').snapshots()
      .map((querySnap) => querySnap.documents.map((documentSnap) => documentSnap.data))
      .map((classi) => classi.where((classe) => RegExp(valoreRicerca, caseSensitive: false).hasMatch(classe['nome']));
  }
}