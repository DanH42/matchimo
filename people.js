var name, position, bio, photo;
var photoRegex = /src=([a-z\.\/]*)/;
var nameRegex = /^[a-z]*/;
var people = [];

function biography(name, position, bio, photo){
	var person = {name: name, /*position: position,*/ bio: anonymize_bio(name, bio)};
	person.photo = "https://imo.im/" + photoRegex.exec(photo)[1];
	people.push(person);
}

function anonymize_bio(name, bio){
	var firstName = nameRegex.exec(name)[0];
	bio = bio.replace(new RegExp(firstName, "gi"), firstName);
	bio = bio.replace(new RegExp(firstName, "gi"), "this person");
	return bio.replace(/(\. t)|(^t)/g, function(v){
		return v.toUpperCase();
	});
}

name="ralph harik";
position="founder";
bio="Ralph has a Bachelor's and Master's degree in computer science from MIT. He spends his free time playing ice hockey, soccer, and tennis.";
photo="<img src=graphics/people/ralph.jpg alt=\"Ralph Harik, imo CEO\" class=people_photo>";
biography(name, position, bio, photo);

name="john rizzo";
position="engineer";
bio="John is currently on leave from the Computer Science Ph.D. program at Stony Brook University so that he can work full-time at imo. He has bachelor's degree in Computer Science from the University of North Texas, where he first studied music for a year. Aside from hacking and programming competitions (and working at imo!), he enjoys traveling, eating, movies, poker, and dogs.";
photo="<img src=graphics/people/john.jpg alt=\"John Rizzo, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="nikola borisov";
position="engineer";
bio="Nikola recently graduated with a BS from Northwestern University in Computer Science, and has liked programming since middle school. He is from Sofia, Bulgaria, and likes to watch Formula 1, WRC, and other motor sports. Nikola also enjoys playing volleyball, soccer, some computer games, and card games. He also likes participating in programming and other science and robotics competitions.";
photo="<img src=graphics/people/nikola.jpg alt=\"Nikola Borisov, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="georgios papoutsis";
position="engineer";
bio="Georgios worked as a software engineer in Germany before joining the imo team. He enjoys spending his free time with his wife and two children. When he has some more spare time (when everybody else is sleeping), he likes solving puzzles or taking part in programming competitions.";
photo="<img src=graphics/people/georgios.jpg alt=\"Georgios Papoutsis, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="johan de ruiter";
position="engineer";
bio="Johan studied Computer Science at Leiden University in The Netherlands. He likes going to the gym and running, and he is very passionate about puzzles and programming competitions.";
photo="<img src=graphics/people/johan.jpg alt=\"Johan de Ruiter, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="marissa senzaki";
position="recruiting";
bio="Marissa is a native of San Francisco and obtained her BA in Psychology from SFSU. She has worked for Facebook and Skype, and also has experience in agency recruiting, where she staffed projects for Google. When she isn't busy helping job applicants, she enjoys learning new skills like mushroom foraging and fantasy football. The two things that can always make her smile are monkeys and ice cream.";
photo="<img src=graphics/people/marissa2.png alt=\"Marissa Senzaki, imo recruiting\" class=people_photo>";
biography(name, position, bio, photo);

name="lorraine lee";
position="marketing";
bio="Lorraine received her Bachelor of Science in Journalism from Northwestern University's Medill School of Journalism, with a minor in French. She enjoys listening to EDM & top 40, watching shows on Netflix and spending time with friends.";
photo="<img src=graphics/people/lorraine.png alt=\"Lorraine Lee, imo marketing\" class=people_photo>";
biography(name, position, bio, photo);

name="michelle yu";
position="recruiting";
bio="Michelle is originally from Los Angeles, and received her bachelors from UC Irvine. Prior to imo.im, she worked at Google and LivingSocial. She enjoys reading, baking, traveling, and karaoke.";
photo="<img src=graphics/people/michelle.png alt=\"Michelle Yu, imo recruiting\" class=people_photo>";
biography(name, position, bio, photo);

name="aneta willis";
position="user safety operations";
bio="Aneta grew up in Poland and Germany. She graduated from Mills College with a degree in Biopsychology. Before joining the imo team, she worked for Facebook. In her spare time, Aneta enjoys traveling, reading, science, watching movies, and spending time with her family.";
photo="<img src=graphics/people/aneta.jpg alt=\"Aneta Willis, imo user safety operations\" class=people_photo>";
biography(name, position, bio, photo);

name="dave keller";
position="ux designer";
bio="Dave grew up in Hawaii, New Zealand, and finally settled in California. When he's not scouring dribbble for inspiration and awesome design, he's reading comics, hanging with friends, and going to midnight showings of the latest movies.";
photo="<img src=graphics/people/dave.jpg alt=\"Dave Keller, imo ux designer\" class=people_photo>";
biography(name, position, bio, photo);

name="georges harik";
position="founder";
bio="Georges Harik was Director of Googlettes and a Distinguished Engineer at Google. As Director of Googlettes, his team was responsible for the product management and strategy efforts surrounding many starting Google initiatives including Gmail, Google Talk, Google Video, Picasa, Orkut, Google Groups and Google Mobile.<br><br>As a Distinguished Engineer, Georges was the co-developer of the technology behind AdSense, the first engineering manager of the Google Search Appliance, and the co-author of the original product plan for the AdWords Online system. Georges has contributed to numerous patents covering Google's search engine and advertising networks.";
photo="<img src=graphics/people/georges.jpg alt=\"Georges Harik, imo founder\" class=people_photo>";
biography(name, position, bio, photo);

name="erdal tuleu";
position="engineer";
bio="Erdal likes playing basketball, working at imo, and traveling. His favorite place is his hometown, Constanta. He also holds a Computer Science and Mathematics degree from Florida Tech.";
photo="<img src=graphics/people/erdal.jpg alt=\"Erdal Tuleu, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="xuan luo";
position="engineer";
bio="Xuan likes eating, sleeping, watching Naruto, updating the Internet, and helping friends.";
photo="<img src=graphics/people/xuan.jpg alt=\"Xuan Luo, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="brandi kolmer";
position="marketing";
bio="Brandi manages marketing and public relations activities for imo. She graduated from the University of California, Davis with a bachelors degree in International Relations. In her spare time she enjoys watching movies, reading tech blogs and playing with her pug.";
photo="<img src=graphics/people/brandi.png alt=\"Brandi Kolmer, imo marketing\" class=people_photo>";
biography(name, position, bio, photo);

name="max kulakov";
position="ux designer";
bio="Max is an experienced web designer who is passionate about beautiful yet usable and friendly interfaces. He strives to create web sites with positive user experiences that will make people happy.";
photo="<img src=graphics/people/max.png alt=\"Max Kulakov, imo UX designer\" class=people_photo>";
biography(name, position, bio, photo);

name="hamza ibrahim";
position="engineer";
bio="Hamza has a BS in Computer Science from Cairo University. Besides working at imo, Hamza enjoys reading, practicing/watching sports and doing programming competitions.";
photo="<img src=graphics/people/hamza.png alt=\"Hamza Ibrahim, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="patrick horn";
position="engineer";
bio="Patrick is a UC Berkeley EECS alumnus who enjoys biking and hiking in parks around Palo Alto. When not hacking or with his brother Daniel, he cares for his two cats, Sister and Tibby, while enjoying music, sci-fi, RPGs, and combinations thereof.";
photo="<img src=graphics/people/patrick.jpg alt=\"Patrick Horn, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="nhat lam";
position="engineer";
bio="Nhat has a Master's degree in computer science from UTD and now is studying towards his PhD. He'd love to join programming contests and play soccer in his free time.";
photo="<img src=graphics/people/nhat.jpg alt=\"Nhat Lam, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="iskren chernev";
position="engineer";
bio="Iskren has a bachelor's degree in CS from Sofia University in Bulgaria. He likes biking, skiing, and working on open source projects.";
photo="<img src=graphics/people/iskren.jpg alt=\"Iskren Chernev, imo engineer\" class=people_photo>";
biography(name, position, bio, photo);

name="sarah best";
position="office manager";
bio="Sarah likes to go to Shasta Lake in the Summer to hike, swim, and wakeboard. She likes to laugh, chat with friends or spend the day in Santa Cruz going to the beach or reading a good book in a coffee shop downtown.";
photo="<img src=graphics/people/sarah.jpg alt=\"Sarah Best, imo office manager\" class=people_photo>";
biography(name, position, bio, photo);
