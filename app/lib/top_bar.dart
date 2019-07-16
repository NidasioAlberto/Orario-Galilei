import 'package:flutter/material.dart';
import 'package:flare_flutter/flare_actor.dart';

class TopBar extends StatefulWidget {
  final Function(String) onCerca;
  final Function(bool) onPreferito;
  final String titolo;
  final bool preferito;

  TopBar({this.onCerca, this.onPreferito, this.titolo, this.preferito = false});

  @override
  _TopBarState createState() => _TopBarState();
}

class _TopBarState extends State<TopBar> {
  TextEditingController controllerRicerca;
  String valoreRicerca = '';
  bool preferito;

  @override
  void initState() {
    super.initState();
    //Inizializzo il controller
    controllerRicerca = TextEditingController();

    //Imposto cosa fare quando il testo viene modificato
    controllerRicerca.addListener(() => setState(() {
      valoreRicerca = controllerRicerca.text;
      widget.onCerca(controllerRicerca.text);
    }));

    preferito = widget.preferito;
  }

  @override
  Widget build(BuildContext context) {
    //Recupero la dimensione della status bar
    double altezzaStatusBar = MediaQuery.of(context).padding.top;

    return Container(
      margin: EdgeInsets.fromLTRB(12.0, 12.0 + altezzaStatusBar, 12.0, 12.0),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
        child: Row(
          mainAxisSize: MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Container(
              child: FlareActor(
                'assets/logo_galilei.flr',
                animation: 'load',
                fit: BoxFit.contain,
                alignment: Alignment.center,
              ),
              width: 48,
              height: 48,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(left: 10.0),
                child: Container(
                  child: (widget.titolo == null ?
                    TextField(
                      controller: controllerRicerca,
                      decoration: InputDecoration(
                        hintStyle: TextStyle(
                          fontSize: 20
                        ), 
                        hintText: 'Cerca',
                        border: InputBorder.none
                      ),
                      /*InputDecoration.collapsed(
                        hintStyle: TextStyle(
                          fontSize: 20
                        ), 
                        hintText: 'Cerca',
                      )*/
                    ) : Text(widget.titolo, style: TextStyle(fontSize: 20))
                  ),
                )
              )
            ),
            //Se l'utente ha inserito un valore di ricerca mostro il bottone per cancellare
            (valoreRicerca.isEmpty ? null : IconButton(
              icon: Icon(Icons.clear),
              onPressed: () => setState(() {
                //Quando l'utente clicca questo bottone elimino il valore di ricerca
                valoreRicerca = '';
                widget.onCerca(valoreRicerca);
                controllerRicerca.clear();

                //Chiudo la tastiera
                FocusScope.of(context).requestFocus(new FocusNode());
              }),
            )),
            //Se il titolo è stato specificato mostro l'icona per tornare alla pagina principale
            (widget.titolo == null ? null : IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                Navigator.pop(context);
              },
            )),
            //Se il titolo è stato speficato mostro l'incona per impostare l'orario come preferito
            (widget.titolo == null ? null : IconButton(
              icon: Icon(preferito ? Icons.star : Icons.star_border),
              onPressed: () => setState(() {
                preferito = !preferito;
                widget.onPreferito(preferito);
              }),
              color: (preferito ? Colors.amber : null),
            )),
          ].where((child) => child != null).toList(),
        ),
      )
    );
  }
}