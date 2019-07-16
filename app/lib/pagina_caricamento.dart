import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flare_flutter/flare.dart';
import 'package:flare_flutter/flare_actor.dart';
import 'package:flare_flutter/flare_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flare_dart/math/mat2d.dart';

class PaginaCaricamento extends StatefulWidget {
  @override
  PaginaCaricamentoState createState() => PaginaCaricamentoState();
}

class PaginaCaricamentoState extends State<PaginaCaricamento> with FlareController {
  Firestore firestore = Firestore.instance;
  ActorAnimation _animazioneIniziale, _animazioneLoop;
  double _durata = 0.0;
  bool _loop = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          AspectRatio(
            child: FlareActor(
              'assets/logo_galilei.flr',
              controller: this,
            ),
            aspectRatio: 1.0,
          ),
          Text(
            'Orari Galilei',
            style: TextStyle(
              fontSize: 40.0
            ),
          ),
        ],
      )
    );
  }

  @override
  void initialize(FlutterActorArtboard artboard) {
    _animazioneIniziale = artboard.getAnimation('load');
    _animazioneLoop = artboard.getAnimation('loading');
  }

  @override
  bool advance(FlutterActorArtboard artboard, double elapsed) {
    _durata += elapsed;

    if(!_loop) {
      if(_durata < _animazioneIniziale.duration) {
        _animazioneIniziale.apply(_durata, artboard, 1.0);
      } else {
        _durata = 0.0;
        _loop = true;
      }
    }

    if(_loop) {
      _durata %= _animazioneLoop.duration;
      _animazioneLoop.apply(_durata, artboard, 1.0);
    }
    
    return true;
  }

  @override
  void setViewTransform(Mat2D viewTransform) {}
}