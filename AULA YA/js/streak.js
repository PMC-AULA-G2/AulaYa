/* AULA — Meta diaria / racha por estudiante
   Meta diaria: completar al menos una lección corta antes de medianoche local.
   Cada día cumplido suma 1 al fuego. La recompensa puede otorgar logros/monedas.
   El contador pertenece al perfil del estudiante, no al dispositivo.
*/
(function(){
  const PREFIX="aula_streak_student_v3:";
  function today(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function profileId(){
    try{
      const p=JSON.parse(localStorage.getItem("aula_current_user")||"null");
      if(p && (p.id||p.email)) return String(p.id||p.email);
    }catch(e){}
    return localStorage.getItem("aula_current_student_id") ||
           localStorage.getItem("aula_current_user_email") || "guest";
  }
  function key(){return PREFIX+profileId().toLowerCase().trim();}
  function get(){
    try{
      const s=JSON.parse(localStorage.getItem(key())||"null");
      if(s && typeof s.count==="number" && s.count>=0) return s;
    }catch(e){}
    return {count:0,last_completed_day:null,total_lessons_completed:0,
            achievements:[],coins_earned_from_streak:0};
  }
  function save(s){localStorage.setItem(key(),JSON.stringify(s));return s;}
  function diff(a,b){
    return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);
  }
  window.AULA_STREAK={
    get:get,
    initializeForNewStudent:function(id){
      const old=profileId();
      if(id) localStorage.setItem("aula_current_student_id",String(id));
      const s={count:0,last_completed_day:null,total_lessons_completed:0,
               achievements:[],coins_earned_from_streak:0};
      localStorage.setItem(PREFIX+String(id||old).toLowerCase().trim(),JSON.stringify(s));
      return s;
    },
    completeLesson:function(meta={}){
      const d=today(),s=get();
      let increased=false;
      if(s.last_completed_day!==d){
        s.count=!s.last_completed_day ? 1 :
          (diff(s.last_completed_day,d)===1 ? s.count+1 : 1);
        s.last_completed_day=d;
        increased=true;
        s.coins_earned_from_streak=(s.coins_earned_from_streak||0)+5;
        document.dispatchEvent(new CustomEvent("aula:streak-increased",{detail:s}));
      }
      s.total_lessons_completed=(s.total_lessons_completed||0)+1;
      s.last_lesson=Object.assign({},meta,{completed_at:new Date().toISOString()});
      save(s);
      document.dispatchEvent(new CustomEvent("aula:lesson-completed",{
        detail:{streak:s.count,increased:increased,meta:meta}
      }));
      return {state:s,increased:increased};
    },
    reset:function(){return save({count:0,last_completed_day:null,total_lessons_completed:0,achievements:[],coins_earned_from_streak:0});}
  };
})();
