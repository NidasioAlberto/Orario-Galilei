import 'package:app/top_bar.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PaginaOrario extends StatefulWidget {
  dynamic dati;
  int giornoOriginale;
  String oggetto, idDocumento;

  PaginaOrario(this.oggetto, this.dati, this.giornoOriginale, this.idDocumento);

  @override
  PaginaOrarioState createState() => PaginaOrarioState();
}

class PaginaOrarioState extends State<PaginaOrario> {
  int giorno = 0;
  String testoGiorno = 'Lunedì';

  @override
  void initState() {
    super.initState();

    giorno = widget.giornoOriginale;
    aggiornaTestoGiorno();
  }

  @override
  Widget build(BuildContext context) {
    double altezzaStatusBar = MediaQuery.of(context).padding.top;
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(64.0 + altezzaStatusBar),
        child: TopBar((valore) {
            print('ciao');
          }, onPreferito: (preferito) async {
            SharedPreferences sharedPreferences = await SharedPreferences.getInstance();

            List<String> preferiti = sharedPreferences.getStringList('Preferiti');

            if(preferiti == null) preferiti = List<String>();

            if(preferito) {
              preferiti.add(widget.idDocumento);
            } else {
              preferiti.remove(widget.idDocumento);
            }

            print(preferiti.toString());

            sharedPreferences.setStringList('Preferiti', preferiti);
          }, preferito: false, titolo: widget.oggetto,
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.only(
            left: 12.0,
            right: 12.0,
            bottom: 12.0,
          ),
          child: Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: TabellaOrario(widget.dati, widget.giornoOriginale)
            )
          ),
        ),
      ),
    );
  }

  aggiornaTestoGiorno() {
    testoGiorno = nomeGiorno(giorno);
  }

  static String nomeGiorno(int _giorno) {
    switch(_giorno) {
      case 0: return 'Lunedì'; break;
      case 1: return 'Martedì'; break;
      case 2: return 'Mercoledì'; break;
      case 3: return 'Giovedì'; break;
      case 4: return 'Venerdì'; break;
      case 5: return 'Sabato'; break;
      default: return '';
    }
  }

  static String nomeOra(int _ora) {
    switch(_ora) {
      case 0: return '1'; break;
      case 1: return '2'; break;
      case 2: return '3'; break;
      case 3: return '4'; break;
      case 4: return '5'; break;
      case 5: return '6'; break;
      case 6: return '1p'; break;
      case 7: return '2p'; break;
      default: return '';
    }
  }
}

class TabellaOrario extends StatelessWidget {
  dynamic dati;
  int giornoOriginale;

  TabellaOrario(this.dati, this.giornoOriginale);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 448,
      width: 816,
      child: Stack(
        children: <Widget>[
          ScrollConfiguration(
            behavior: ScrollBehavior(),
            child: ListView(
              padding: EdgeInsets.only(
                top: 8.0,
                left: 8.0 + 32.0,
                right: 8.0,
                bottom: 8.0
              ),
              scrollDirection: Axis.horizontal,
              children: <Widget>[]..addAll(List.generate(6, (index) => Column(
                  children: List.generate(9, (index2) => ElementoOrario(dati, index, index2 - 1, giornoOriginale))
                )
              )),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,

              borderRadius: BorderRadius.circular(8.0)
            ),
            padding: EdgeInsets.only(
              top: 8.0,
              left: 8.0
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(9, (index) => OraOrario(index - 1)),
            ),
          ),
        ],
      )
    );
  }
}

class ElementoOrario extends StatelessWidget {
  String info1, info2;
  int giorno, ora, oggi;
  dynamic dati;

  ElementoOrario(this.dati, this.giorno, this.ora, this.oggi);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: (ora !=  7 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
          top: (ora !=  -1 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
          left: (giorno != 0 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
          right: (giorno != 5 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
        )
      ),
      height: 48.0,
      width: 128.0,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: (ora != -1 ? <Widget>[
            Text(dati['orarioPerGiorni'][giorno]['info1'][ora]['nome']),
            Text(dati['orarioPerGiorni'][giorno]['info2'][ora]['nome']),
          ] :
          <Widget>[
            Text(PaginaOrarioState.nomeGiorno(giorno))
          ]
        )
      ),
    );
  }
}

class OraOrario extends StatelessWidget {
  String testoGiorno;
  int index;

  OraOrario(this.index) {
    testoGiorno = PaginaOrarioState.nomeOra(index);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: (index !=  7 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
          top: (index !=  -1 ? BorderSide(color: Colors.black, width: 0.5) : BorderSide.none),
          right: BorderSide(color: Colors.black, width: 1),
        )
      ),
      height: 48.0,
      width: 32.0,
      child: Center(
        child: Text(testoGiorno),
      ),
    );
  }
}