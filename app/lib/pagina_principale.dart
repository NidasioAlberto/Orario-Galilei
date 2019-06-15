import 'package:app/top_bar.dart';
import 'package:flutter/material.dart';

class PaginaPrincipale extends StatefulWidget {
  @override
  PaginaPrincipaleState createState() => PaginaPrincipaleState();
}

class PaginaPrincipaleState extends State<PaginaPrincipale> {
  String valoreRicerca = '';

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    double altezzaStatusBar = MediaQuery.of(context).padding.top;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(64.0 + altezzaStatusBar),
        child: TopBar((valore) => setState(() => valoreRicerca = valore))
      ),
      body: SafeArea(
        child: Text(valoreRicerca)
      ),
    );
  }
}