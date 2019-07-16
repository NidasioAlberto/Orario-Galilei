import 'package:app/elemento_lista.dart';
import 'package:flutter/material.dart';

class Ricerca extends StatelessWidget {
  final String valoreRicerca;
  Stream orari;
  List dati;

  Ricerca(this.valoreRicerca, this.orari);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: orari,
      initialData: [],
      builder: (context, AsyncSnapshot snap) {
        List dati = snap.data.toList();

        dati = dati.where((orario) => RegExp(valoreRicerca, caseSensitive: false).hasMatch(orario['nome'])).toList();

        return ListView.builder(
          itemCount: dati.length,
          itemBuilder: (context, position) {
            return ElementoLista(dati[position]);
          },
        );
      }
    );
  }
}