package main_game.shmabledum
{
   import main_game.items.Item;
   
   public class SpecialMixTip extends BubbleGumTip
   {
      
      public function SpecialMixTip(param1:Item)
      {
         super(main.locale.get("pbSpecialMixEnd",[param1.getNameToShow()]),param1);
      }
   }
}

