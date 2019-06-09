import 'package:app/elemento_lista.dart';
import 'package:flutter/material.dart';

class Ricerca extends StatelessWidget {
  String valoreRicerca;
  List dati;

  Ricerca({this.valoreRicerca, this.dati}) {
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
}
