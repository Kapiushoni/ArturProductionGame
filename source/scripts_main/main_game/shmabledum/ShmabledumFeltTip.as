package main_game.shmabledum
{
   import util.Util;
   
   public class ShmabledumFeltTip implements ShmabledumInteraction
   {
      
      private var tip:BubbleGumTip;
      
      private var feeling:ShmabledumFeeling;
      
      public function ShmabledumFeltTip(param1:BubbleGumTip, param2:ShmabledumFeeling)
      {
         super();
         this.tip = param1;
         this.feeling = param2;
      }
      
      public function make(param1:InteractiveShmabledum) : void
      {
         param1.expressFeeling(this.feeling,Util.l(this.tip.make,param1));
      }
   }
}

