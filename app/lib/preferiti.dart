import 'package:app/elemento_lista.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Preferiti extends StatefulWidget {
  List dati;

  Preferiti(this.dati);

  @override
  PreferitiState createState() => PreferitiState();
}

class PreferitiState extends State<Preferiti> {
  List dati;

  @override
  void initState() {
    super.initState();

    dati = widget.dati;

    SharedPreferences.getInstance().then((sharedPreferences) {
      List<String> preferiti = sharedPreferences.getStringList('Preferiti');

      if(preferiti != null) dati = dati.where((elemento) => preferiti.contains(elemento['id'])).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return (dati != null ? ListView.builder(
      itemCount: dati.length,
      itemBuilder: (context, position) {
        return ElementoLista(dati[position]);
      },
    ) : Center(child: Text('Preferiti mancanti'),));
  }
}