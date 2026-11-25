package main_game.shmabledum
{
   public class ShmabledumFeeling implements ShmabledumInteraction
   {
      
      private var theFeeling:String;
      
      public function ShmabledumFeeling(param1:String)
      {
         super();
         this.theFeeling = param1;
      }
      
      public static function getJoy() : ShmabledumFeeling
      {
         return new ShmabledumFeeling("happy");
      }
      
      public static function getSadness() : ShmabledumFeeling
      {
         return new ShmabledumFeeling("sad");
      }
      
      public function get feeling() : String
      {
         return this.theFeeling;
      }
      
      public function make(param1:InteractiveShmabledum) : void
      {
         param1.expressFeeling(this);
      }
   }
}

