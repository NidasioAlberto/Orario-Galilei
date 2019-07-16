import 'package:app/pagina_caricamento.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() {
  //All'avvio dell'app imposto i dati offline abilitati
  Firestore.instance.settings(
    persistenceEnabled: true
  );

  runApp(MaterialApp(
    title: 'Orari Galilei',
    home: PaginaCaricamento(),
  ));
}