import 'package:app/pagina_orario.dart';
import 'package:flutter/material.dart';

class ElementoLista extends StatelessWidget {
  dynamic dati;
  int giorno, ora;
  bool fuoriOrario1, fuoriOrario2;
  String titolo;

  ElementoLista(this.dati) {
    giorno = DateTime.now().weekday - 1;
    ora = DateTime.now().hour - 8;

    //1: Controllo se siamo di mattina
    if(controlloMattina(ora)) {
      //In questo caso mostro l'orario della prima ora
      ora = 0;
    }

    //2: Controllo se siamo fuori orario
    fuoriOrario1 = controlloFuoriOrario(ora, giorno);
    fuoriOrario2 = controlloFuoriOrario(ora + 1, giorno);

    //3: Imposto il titolo
    titolo = dati['tipo'] + ': ' + dati['nome'];
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PaginaOrario(this.titolo, this.dati, this.giorno, dati['nome']),
          ),
        );
      },
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12.0),
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: ListTile(
            title: Text(titolo),
            subtitle: (
              Row(
                children: <Widget>[
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8.0,
                        vertical: 4.0
                      ),
                      child: (fuoriOrario1 ?
                        Text(
                          'Fuori orario',
                          style: TextStyle(
                            color: Colors.white
                          ),
                        ) :
                        Text(
                          dati['orarioPerGiorni'][giorno]['info2'][ora]['ora'] + (ora < 6 ? 'ª' : '') + ' - ' + dati['orarioPerGiorni'][giorno]['info2'][ora]['nome'] + ' - ' + dati['orarioPerGiorni'][giorno]['info1'][ora]['nome'],                  
                          style: TextStyle(
                            color: Colors.white
                          ),
                        )
                      )
                    ),
                    color: Color(0xff4688F4),
                  ),
                  Icon(Icons.arrow_forward),
                  Flexible(
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8.0,
                          vertical: 4.0
                        ),
                        child: (fuoriOrario2 ? Text('Fuori orario') : Text(
                            dati['orarioPerGiorni'][giorno]['info2'][ora + 1]['ora'] + (ora < 6 ? 'ª' : '') +' - ' + dati['orarioPerGiorni'][giorno]['info2'][ora + 1]['nome'] + ' - ' + dati['orarioPerGiorni'][giorno]['info1'][ora + 1]['nome'],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          )
                        ),
                      ),
                      color: Colors.amber
                    )
                  )
                ],
              )
            ),
          ),
        ),
      ),
    );
  }

  bool controlloMattina(int ora) => ora < 0;

  bool controlloFuoriOrario(int ora, int giorno) {
    bool _fuoriOrario = ora < 0 || ora > 7 || giorno > 5;
    if(!_fuoriOrario) _fuoriOrario = dati['orarioPerGiorni'][giorno]['info2'][ora]['nome'] == '' && dati['orarioPerGiorni'][giorno]['info1'][ora]['nome'] == '';
    return _fuoriOrario;
  }
}