import { Injectable } from '@angular/core';
import { ILoad, IOutput } from '../interfaces/load.interface';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadsService {
  public verifiedLoads: ILoad[] = [];

  constructor(
  ) {}

  public getData(): Observable<IOutput> {

      return Observable.create(observer => {
      fetch('./assets/input.json').then(res => res.json())
        .then( inputs => {
          // Converting load amount value from string to float for each object inside array
          const formated = inputs.map( load => {
              load.load_amount = parseFloat(load.load_amount.split("$")[1]);
              return load;
            }
          );

          // Interval created for sending data to observers
          let i = 0;
          const arrayInterval = setInterval(() => {
            const outPut = this.checkLoadRules(formated[i]);
            console.log(outPut);
            observer.next(outPut);
            i++;
            if(i == formated.length) {
              clearInterval(arrayInterval);
            }
          },0);
        });
      });
    
 }
  
  /**
   * Function to return a filtered array of load objects according to the moment parameter("day" or "week")
   * @param filter:  "day" or "week"
   * @param currentLoad: load object that will be used inside the filter.
   */
  private dayWeekFilter(filter, currentLoad): ILoad[] {
    return this.verifiedLoads.filter( vl =>  
        (moment(vl.time.split("T")[0]).isSame(currentLoad.time.split("T")[0], filter) && 
        vl.customer_id == currentLoad.customer_id));
  }

  private checkLoadRules(currentLoad: ILoad) {
    let isValid = true; //begins the logic considering the load has been accepted

    this.verifiedLoads.push({
      id: currentLoad.id,
      customer_id: currentLoad.customer_id,
      load_amount: currentLoad.load_amount,
      time: currentLoad.time
  });
    const sameDayArray = this.dayWeekFilter("day", currentLoad);
    if ( sameDayArray.length > 3 ) { 
      // If current load is the fourth one on the same day it will be declined
      // A maximum of 3 loads can be performed per day, regardless of amount
      isValid = false;
    } 
    
    if(sameDayArray.length <= 3 ) {
      // Same day but 3 or less loads were found
      // summing the amount to check if it is over $5000
      
      const totalDay = sameDayArray.reduce((total: any, current) => {
          return total + current.load_amount 
      }, 0);
      // A maximum of $5000 can be loaded per day
      if (totalDay > 5000) isValid = false

      // Checking amount of loads per week
      const sameWeekArray = this.dayWeekFilter("week", currentLoad);
      const totalWeek = sameWeekArray.reduce((total: any, current) => {
          return total + current.load_amount 
      }, 0);
      // A maximum of $20000 can be loaded per day
      if (totalWeek > 20000) isValid = false
    }

    let outPut: IOutput;
    // Verifies isValid value for creating outPut object and remove load from verifiedLoads array if needed
    if (isValid) {
        outPut = {
          id: currentLoad.id,
          customer_id: currentLoad.customer_id,
          accepted: true 
        };
      } else {
        this.verifiedLoads.pop();
        outPut = {
          
          id: currentLoad.id,
          customer_id: currentLoad.customer_id,
          accepted: false
        };
      }
    
    return outPut;
  }
}
