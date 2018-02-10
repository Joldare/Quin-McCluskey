
	var input_text = document.getElementById("input_text");//the minterms. it must be entered like this >> 4,2,3,1,6,7,
	var input_letters = document.getElementById("input_letters");
	var shower = document.getElementById("shower");//shows the results at the end of the page
	var resultshower = document.getElementById("resultShower");//shows the result at the middle of the page
	
	var minterms = str_to_numbers(input_text.value,",");
	var letters = str_to_numbers(input_letters.value," ");
	
	var sorting_column = 0;//it is used in sort functions and specifies the column of the table to be sorted with.
	var prime_rows="";//prime implicants are collected in it as a string in a form like this >> A'BC',4,5-A'D'0,2,4,6
	var all_results = new Array();// this array will be filled by strings of all posible answers
	var final_result = "";
function process()//this funtion runs when the button "Process" is pressed
{
	if (!input_text.checkValidity())
	{
		alert("minterms input is not valid!");
		clear_previous_results();
	}
	else if(!input_letters.checkValidity())
	{
		alert("letters input is not valid!");
		clear_previous_results();
	}
	else
	{
  try
  {
	shower.innerHTML = "";//Clearing previous results
	input_text = document.getElementById("input_text");
	input_letters = document.getElementById("input_letters");
	sorting_column = 0;
	prime_rows="";//Clearing previous prime implicants
	
	minterms = str_to_numbers(input_text.value,",");
	letters = str_to_numbers(input_letters.value," ");

	//validating the inputs
	if (!validate_inputs(minterms,letters)) return;
	
	
	
	var ess_res_str = "";
	all_results = new Array();
	final_result = "";
	
	
	//first table
	var first_table = new table(3+letters.length);
	
	for(var mi=0;mi<minterms.length;mi++)
	{
		//Adding new row to first table
		first_table.cell[mi] = new Array(first_table.columns_number);
		first_table.rows_number++;
		
		var numberOfOnes = 0;
		var temp = minterms[mi];//put next minterm in temp
		
		first_table.cell[mi][0] = temp;//add next minterm to first column of first table
		
		//Convering minterms from decimal to binary and put them in table
		for(i=letters.length;i>0;i--)
		{
			first_table.cell[mi][i]=temp%2;
			if (first_table.cell[mi][i]==1) numberOfOnes++;//also collecting number of ones of the binary form
			temp = (temp-temp%2)/2;
		}
		
		first_table.cell[mi][letters.length+2] = numberOfOnes;//adding number of ones to the table
		first_table.cell[mi][letters.length+1] = 0;//this column shows if this row is a prime implicant (0=it's a prime implicant

	}
	
	sorting_column = 0;
	first_table.cell.sort(sortFunction);
	sorting_column = letters.length+2;
	first_table.cell.sort(sortFunction);
	
	
	while (first_table.rows_number>0)
	{
	//second table
	var second_table = new table(letters.length+2);
	//this table has 1 less column and its because of that it doesn't have the "numberOfOnes" column
	
	for(var i=0;i<first_table.rows_number;i++)
	{
		for(var j=i+1;j<first_table.rows_number;j++)
		{
			var num_dif=0;// number of bit difference with the other rows 
			var index_dif=0;
			//comparison between all rows to calculate number of differences.
			for (var k=1;k<=letters.length;k++)
			{
				if(first_table.cell[i][k]!=first_table.cell[j][k])
				{
					num_dif++;
					index_dif = k;
				}
			}
			
			
			if (num_dif==1)
			{
				//"prime"columns of those rows that have one difference changes to "1"
				//and are added to second table
				
				first_table.cell[i][letters.length+1] = 1;
				first_table.cell[j][letters.length+1] = 1;
				//adding new row to second table
				second_table.cell[second_table.rows_number] = new Array(second_table.columns_number); 
				//minterms of second table(filling "mi" column)
				second_table.cell[second_table.rows_number][0] = first_table.cell[i][0]+","+first_table.cell[j][0];
				//copying from first table to second table (except the difference cell)
				for (var k=1;k<=letters.length;k++)
					second_table.cell[second_table.rows_number][k] = first_table.cell[i][k];
				second_table.cell[second_table.rows_number][index_dif]="-";
				second_table.cell[second_table.rows_number][second_table.columns_number-1]=0;
				second_table.rows_number++;
				
			}
		}
	}
	
	//adding implicant primes of first table to result(those that their "prime" columns is 0)
	
	for(var i=0;i<first_table.rows_number;i++)
	{
		var new_prime = "";
		if(first_table.cell[i][letters.length+1]==0)//checking "prime" column
		{
			//converring binary to letter form  eg: 010-   A'BC'
			for(var k=1;k<=letters.length;k++)
			{
				if (first_table.cell[i][k]==0)
					new_prime+=letters[k-1]+"'";
				else if (first_table.cell[i][k]==1)
					new_prime+=letters[k-1];
			}
			//new_prime+=" ";
		}
		
		//adding new_prime to prime_rows
		if (ess_res_str.match(new_prime)!=new_prime)//checking the new_prime to be not iterative
		{
			if (ess_res_str == "")
			{
				ess_res_str+=(ess_res_str==""?"":"+")+ new_prime;
				prime_rows+=new_prime+","+first_table.cell[i][0];
			}
			else
			{
				ess_res_str+= "+" + new_prime;
				prime_rows+="-"+new_prime+","+first_table.cell[i][0];
			}
		}
	}
	
	//adding the table to the page
	show_table(first_table);
	//puting second_table to first_table and repeating the process
	first_table = second_table;
	}//end while
	
	
	//getting primes from prime_rows and puting them in "primes" array
	var primes = prime_rows.split("-");//"primes" cell form>> A'BC',4,5
	myprime = new Array(primes.length);//"myprime" cell form>> A'BC'
	var prime_table = new Array(primes.length);//this table is "prime implicant chart" and is a 2d array
	for (var i=0;i<primes.length;i++)
	{
		prime_table[i] = new Array(minterms.length);//adding new row to prime_table
		for (var j=0;j<minterms.length;j++)
			prime_table[i][j]="-";
			
		local_minterms = primes[i].split(",");
		myprime[i] = local_minterms[0];//putting letters of prime to myprime

		for (var k=1;k<local_minterms.length;k++)
		{
			for (var j=0;j<minterms.length;j++)
			{
				
				if (local_minterms[k]==minterms[j])
				{
					prime_table[i][j] = "*";
					break;
				}
			}
			
		}
	}
	
	
	shower.innerHTML +=("<br> Prime implicant chart");
	shower.innerHTML += array_to_html(prime_table,myprime);
	
	
	//calculating the ess_res_str from "prime implicant chart"
	ess_res_str = "";
	var numOfMatches = 0;
	var index;
	var result_number=0;
	
	//this for loop adds essential prime implicants to ess_res_str
	//essectial prime implicants are those rows that at least one of their "*"s doesn't have any other "*" in their column
	
	
	var essential_index = new Array();
	for (var i=0;i<minterms.length;i++)
	{
		numOfMatches = 0;//number of * in every column
		 for (var j=0;j<prime_table.length;j++)
		 {
		 	if (prime_table[j][i] == "*")
				{
				numOfMatches++;
				index = j;
				}
		 }
		 if (numOfMatches==1)
		 {
			 
			 if (ess_res_str.match(myprime[index])!=myprime[index])
			 {
			 essential_index.push(index);
			 ess_res_str += (ess_res_str==""?"":"+")+myprime[index];
			 result_number++;
			 }
		 }
		 if (result_number==prime_table.length)
		 	break;
	}
	
	
	//the index of the minterms that are not in essential primes are stored in "lost_index" array
	var lost_index = new Array();
	var lost_flag = true;
	for(var j=0;j<minterms.length;j++)
	{
		lost_flag = true;
		for (var i=0;i<essential_index.length;i++)
		{
			if (prime_table[essential_index[i]][j]=="*")
				lost_flag = false;
		}
		if (lost_flag)
		{
			lost_index.push(j);
			
		}
	}
	
	if (lost_index.length!=0)
	{
		var not_essential_index = new Array();//index or row of primes that are not essential
		var is_ess_flag = false;
		for (var i=0;i<prime_table.length;i++)
		{
			is_ess_flag = false;
			for(var j=0;j<essential_index.length;j++)
			{
				if (i==essential_index[j])
					is_ess_flag = true;
			}
			if (!is_ess_flag)
				not_essential_index.push(i);
		}
			
		

	
		var lost_matrix = new Array();
		if (not_essential_index.length!=0)
		{
			for(var ess=0;ess<not_essential_index.length;ess++)
			{
				
				for(var j=0;j<lost_index.length;j++)
				{
					if (prime_table[not_essential_index[ess]][lost_index[j]]=="-")
					{
						lost_matrix.push(new Array());
						for(var k=ess;k<not_essential_index.length;k++)
						{
							if (prime_table[not_essential_index[k]][lost_index[j]]=="*")
							{
								lost_matrix[lost_matrix.length-1].push(myprime[not_essential_index[k]]);
							}
						}
					}
				}
				add_res_from_matrix("",0,lost_matrix,ess_res_str+"+"+myprime[not_essential_index[ess]]);
				
				lost_matrix = new Array();
			}//end ess loop
		}//end if
		
		//getting results with least number of primes
		if (all_results.length!=0)
		{
			var min_prime = all_results[0].split("+").length;
			for(var i=0;i<all_results.length;i++)
			{
				var temp = all_results[i].split("+").length;
				if ( temp<min_prime)
					min_prime = temp;
			}
			
			
			var counter = 1;
			//showing the results with least size
			for (var i=0;i<all_results.length;i++)
			{
				var temp = all_results[i].split("+").length;
				if (temp == min_prime)
				{
					final_result+=(counter)+")"+all_results[i]+"<br>";
					counter++;
				}
			}
			
			shower.innerHTML += "********* <br>Results<br>"+final_result;
			resultShower.innerHTML = "Results<br>"+final_result;
		}//end if
	}
	else
	{
		shower.innerHTML += "********* <br>Result<br>"+ess_res_str;
		resultShower.innerHTML = "Result<br>"+ess_res_str;
	}
	}
	catch(err)
  {
	var txt="";
  txt+="Error description: " + err.message + "\n\n";
  alert(txt);
  }
	}
}//end process function
function show_trigger()
{
	
	if (document.getElementById("shower").style.visibility != "hidden")
		document.getElementById("shower").style.visibility = "hidden";
	else
		document.getElementById("shower").style.visibility = "visible";
	
}
function table(columns)
{
	
	
	this.columns_number = columns;
	this.rows_number = 0;
	this.cell = new Array(40);

}
function str_to_numbers(s,c)
{
	var parts = s.split(c);
	for(var i=0;i<parts.length;i++)
	{
		if (Number(parts[i])>=0) parts[i] = Number(parts[i]);
	}
	return parts;
}
function show_table(t)
{
	shower.innerHTML+=table_to_html(t);

	shower.innerHTML += "<br>********* ";
	
}
function sortFunction(a, b) 
{
    if (a[sorting_column] === b[sorting_column]) {
        return 0;
    }
    else {
        return (a[sorting_column] < b[sorting_column]) ? -1 : 1;
    }
}
function table_to_html(t) 
{
    var result = "<table border=1>";
	result += "<tr> <td>mi</td> ";
	for(var k=0;k<letters.length;k++)
		result+= "<td>"+letters[k]+"</td>";
	result+="<td>prime</td>";
	result+= " </tr>";
	
    for(var i=0; i<t.rows_number; i++) {
        result += "<tr>";
        for(var j=0; j<t.columns_number; j++){
            result += "<td>"+t.cell[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
function array_to_html(arr,primes)
{
	var result = "<table border=1>";
	result += "<tr> <td></td> ";
	for(var k=0;k<minterms.length;k++)
		result+= "<td>"+minterms[k]+"</td>";
	result+= " </tr>";
    for(var i=0; i<arr.length; i++) {
        result += "<tr>";
		result += "<td>"+primes[i]+"</td>"
        for(var j=0; j<arr[i].length; j++){
            result += "<td>"+arr[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
function matrix_to_html(mat)
{
	var result = "<table border=1>";
    for(var i=0; i<mat.length; i++) {
        result += "<tr>";
        for(var j=0; j<mat[i].length; j++){
            result += "<td>"+mat[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}

function add_res_from_matrix(res,row,arr,ess)//fills the "all_results"
{	
	//Base Case
	if (row>=arr.length)
	{
		
			//all_results.push(ess+(res.length!=0?"+"+res:""));
			all_results.push(ess+res);
			return;
	}
	for(var i=0;i<arr[row].length;i++)
	{
		
		arguments.callee(new String(res+((res.match(arr[row][i])!=arr[row][i])?(arr[row][i].length!=0?"+"+arr[row][i]:""):"")),row+1,arr,ess)
	}
}

function validate_inputs(minterms,letters)
{
	
	//handling if the number of letters is not compatable with minterms
	for (var i=0;i<minterms.length;i++)
	{
		if (minterms[i]>=Math.pow(2,letters.length))
		{
			alert("Error: minterm'"+minterms[i]+"' is illegal for "+letters.length+" letters");
			clear_previous_results();
			return false;
		}
	}
	return true;
}
function clear_previous_results()
{
	resultshower.innerHTML ="...";
	shower.innerHTML = "";
}
