import java.io.*;
import java.net.*;
import java.util.ArrayList;  
import java.util.List;  

public class ConvertPropertiesFileToJson{	
    private static void appendtoJsonFile(String fileName, String content,String encode) {        
        try {
            System.out.println("The target file encode is: " + encode);
            OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8");
            BufferedWriter writer = new BufferedWriter(write);
            writer.write(content);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private static String getCodeString(String fileName){  
        String code = null; 
        BufferedInputStream bin = null;
        try {
            bin = new BufferedInputStream(new FileInputStream(fileName));  
            int p = (bin.read() << 8) + bin.read();  
            switch (p) {  
                case 0xefbb:  
                    code = "UTF-8";  
                    break;  
                case 0xfffe:  
                    code = "Unicode";  
                    break;  
                case 0xfeff:  
                    code = "UTF-16BE";  
                    break;  
                default:  
                    code = "GBK";  
            }
        } catch (IOException e) {
                    e.printStackTrace();
        } finally {
            if (bin != null) {
                try {
                    bin.close();
                } catch (IOException e1) {
                }
            }
        }  
        
        return code;  
    }  
    
    private static String convertToKeyValue(String sLine,int firstNonComment) {
        String sTemp = "";
        
        String[] aTempArray = sLine.split("=", 2); 
        if(aTempArray.length == 2){
            if(firstNonComment > 1){
                sTemp = ",\n" + "\t\"" + aTempArray[0].trim() + "\"" + ": " + "\"" + aTempArray[1].trim() + "\"";  
            }         
            else{
                sTemp = "\t\"" + aTempArray[0].trim() + "\"" + ": " + "\"" + aTempArray[1].trim() + "\"";
            }
        }
        else if(aTempArray.length == 1){
            if(firstNonComment > 1){
                sTemp = ",\n" + "\t\"" + aTempArray[0].trim() + "\"" + ": " + "\"" + "\"";  
            }         
            else{
                sTemp = "\t\"" + aTempArray[0].trim() + "\"" + ": " + "\"" + "\"";
            }        
        }
        else{           
        }
        return sTemp;
    }
	
    private static boolean CreateFile(String destFileName) {  
	    File file = new File(destFileName);  
	    if (file.exists()) {
	    	file.delete();
		     //System.out.println("The file name " + destFileName + " create failed, it's exists.");  
		     //return false;  
	    }  
	    if (destFileName.endsWith(File.separator)) {  
		     System.out.println("The file " + destFileName + " create failed,it can not be dir!");  
		     return false;  
	    }  
	    if (!file.getParentFile().exists()) {  
		     System.out.println("the path not exists, creating...");  
		     if (!file.getParentFile().mkdirs()) {  
			      System.out.println("create path failed.");  
			      return false;  
		     }  
	    }  

	    try {  
	     	if (file.createNewFile()) {  
		      System.out.println("create file " + destFileName + "success!");  
		      return true;  
		     } 
			 else {  
			      System.out.println("create file " + destFileName + "failed!");  
			      return false;  
		     }  
	    } catch (IOException e) {  
		     e.printStackTrace();  
		     System.out.println("create file " + destFileName + "failed");  
		     return false;  
	    }  
	}  
    
    private static List<String> getAllPropertiesFile(File fileDirectory){
        List<String> resultFileNameList = new ArrayList<String>();
        File[] files = fileDirectory.listFiles();
        if(files==null) return resultFileNameList;//empty fileDirectory
        for (File f : files) {
            if(f.isDirectory()){
                resultFileNameList.add(f.getPath());
            }else{
                String filePath = f.getPath();
                if(filePath.indexOf(".properties") >= 0 && filePath.indexOf("i18n.properties") < 0){
                    resultFileNameList.add(f.getName());
                }
            }
                
        }
        return resultFileNameList;
    }
    
    private static void removeCommentToJson(String fileFromNamePath, String fileToNamePath) {
        String encode = getCodeString(fileFromNamePath);
        System.out.println("The source file encode is: " + encode);
        File file = new File(fileFromNamePath);
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(new FileInputStream(fileFromNamePath), encode));  
            String tempString = null;
            String result = "{\n";
            int firstNonComment = 0;
            
            while ((tempString = reader.readLine()) != null) {      	
    	        if(!(tempString.indexOf("#") >= 0) && tempString.length() > 0 && null != tempString){
                    firstNonComment++;
                    result = result + convertToKeyValue(tempString,firstNonComment);                    
		      }	
            }
            
            result += "\n}";
            appendtoJsonFile(fileToNamePath,result,encode);
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (reader != null) {//fInputStream != null && inputStreamReader != null && 
                try {
                    reader.close();
                } catch (IOException e1) {
                }
            }
        }
    }
	
    public static void main(String[] args) {
        String fileFromPath = "./";
        String fileToPath = "../";
        List<String> allPropertiesFile = getAllPropertiesFile(new File(fileFromPath));

        for(String file : allPropertiesFile){
            String fileNameFromPath = fileFromPath + file;
            String filePrefixName = file.substring(0,file.indexOf("."));
            String fileNameToPath = fileToPath + file.substring(0,file.indexOf(".")) + ".json";
            ConvertPropertiesFileToJson.CreateFile(fileNameToPath);//create file
            ConvertPropertiesFileToJson.removeCommentToJson(fileNameFromPath,fileNameToPath);//remove comment
        }
    }
}