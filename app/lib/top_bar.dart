import 'package:flutter/material.dart';
import 'package:flare_flutter/flare_actor.dart';

class TopBar extends StatefulWidget {
  Function(String) onCerca;
  Function(bool) onPreferito;
  String titolo;

  TopBar({this.onCerca, this.titolo, this.onPreferito});

  @override
  _TopBarState createState() {
    return _TopBarState();
  }
}

class _TopBarState extends State<TopBar> {
  String valoreRicerca = '';
  TextEditingController controllerRicerca;
  bool preferito = false;

  @override
  void initState() {
    super.initState();
    controllerRicerca = TextEditingController();

    controllerRicerca.addListener(() => setState(() {
      valoreRicerca = controllerRicerca.text;
      widget.onCerca(controllerRicerca.text);
    }));
  }

  @override
  Widget build(BuildContext context) {
    double altezzaStatusBar = MediaQuery.of(context).padding.top;

    return Container(
      margin: EdgeInsets.fromLTRB(
        12.0,
        12.0 + altezzaStatusBar,
        12.0,
        12.0
      ),
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Stack(
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.end,
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
                    child: (widget.titolo == null ?
                      TextField(
                        controller: controllerRicerca,
                        decoration: InputDecoration.collapsed(
                          hintStyle: TextStyle(
                            fontSize: 20
                          ),
                          hintText: 'Cerca'
                        ),
                      ) : Text(
                          widget.titolo,
                          style: TextStyle(fontSize: 20),
                        )
                      )
                  )
                ),
                (valoreRicerca.isEmpty ? null : IconButton(
                  icon: Icon(Icons.clear),
                  onPressed: () => setState(() {
                    valoreRicerca = '';
                    widget.onCerca(valoreRicerca);
                    controllerRicerca.clear();
                    FocusScope.of(context).requestFocus(new FocusNode());
                  }),
                )),
                (widget.titolo == null ? null : IconButton(
                  icon: Icon(Icons.arrow_back),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                )),
                (widget.titolo == null ? null : IconButton(
                  icon: Icon((preferito ? Icons.star : Icons.star_border)),
                  onPressed: () => setState(() {
                    preferito = !preferito;
                    widget.onPreferito(preferito);
                  }),
                  color: (preferito ? Colors.amber : null),
                )),
              ].where((child) => child != null).toList(),
            ),
          ],
        ),
      )
    );
  }
}