import { Component } from '@angular/core';
import { LoadsService } from '../services/loads.service';
import { IOutput } from '../interfaces/load.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  outPut: IOutput[] = [];
  constructor(
    private loadsService: LoadsService
  ) {}

  ionViewDidEnter() {
    this.loadsService.getData().subscribe(data => {
      this.outPut.push({
        id: data.id,
        customer_id: data.customer_id,
        accepted: data.accepted
      });
    });
  }
}
