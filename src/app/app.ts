import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BallonError } from './error/ballon-error/ballon-error';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BallonError],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
