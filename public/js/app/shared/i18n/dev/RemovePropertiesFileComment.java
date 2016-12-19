import java.io.*;
import java.net.*;
import java.util.ArrayList;
import java.util.List;

public class RemovePropertiesFileComment {
	public static void appendtoPropertiesFile(String fileName, String content, boolean appendResult) {
		try {
			FileWriter writer = new FileWriter(fileName, appendResult);
			writer.write(content + "\n");
			writer.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static void removeCommentToProperties(String fileFromNamePath, String fileToNamePath) {
		File file = new File(fileFromNamePath);
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new FileReader(file));
			String tempString = null;
			int line = 1;
			boolean appendResult = true;
			while ((tempString = reader.readLine()) != null) {
				if (!(tempString.indexOf("#") >= 0) && tempString.length() > 0 && null != tempString) {
					if (line > 1) {
						appendtoPropertiesFile(fileToNamePath, tempString, appendResult);
					} else {
						appendtoPropertiesFile(fileToNamePath, tempString, false);
					}
				}
				line++;
			}
			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e1) {
				}
			}
		}
	}

	public static void readFileByLines(String fileNamePath) {
		File file = new File(fileNamePath);
		BufferedReader reader = null;
		try {
			System.out.println("Read " + fileNamePath + "file as line:");
			reader = new BufferedReader(new FileReader(file));
			String tempString = null;
			int line = 1;
			while ((tempString = reader.readLine()) != null) {
				System.out.println("line " + line + ":" + tempString);
				line++;
			}
			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e1) {
				}
			}
		}
	}

	public static boolean CreateFile(String destFileName) {
		File file = new File(destFileName);
		if (file.exists()) {
			file.delete();
			// System.out.println("The file name " + destFileName + "create
			// failed, it's exists.");
			//return false;
		}
		if (destFileName.endsWith(File.separator)) {
			System.out.println("The file " + destFileName + "create failed,it can not be dir!");
			return false;
		}
		if (!file.getParentFile().exists()) {
			System.out.println("the path not exists, creating...");
			if (!file.getParentFile().mkdirs()) {
				System.out.println("create path failed.");
				return false;
			}
		}

		// create file
		try {
			if (file.createNewFile()) {
				System.out.println("create file " + destFileName + "success!");
				return true;
			} else {
				System.out.println("create file " + destFileName + "failed!");
				return false;
			}
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println("create file " + destFileName + "failed");
			return false;
		}
	}

	public static List<String> getAllPropertiesFile(File fileDirectory) {
		List<String> resultFileNameList = new ArrayList<String>();
		File[] files = fileDirectory.listFiles();
		if (files == null)
			return resultFileNameList;// empty fileDirectory
		for (File f : files) {
			if (f.isDirectory()) {
				System.out.println(f.getAbsolutePath());
				resultFileNameList.add(f.getPath());
			} else {
				String filePath = f.getPath();
				if (filePath.indexOf(".properties") >= 0) {
					resultFileNameList.add(f.getName());
				}
			}

		}
		return resultFileNameList;
	}

	public static void main(String[] args) {
		String fileFromPath = "./";
		String fileToPath = "../properties/";
		List<String> allPropertiesFile = getAllPropertiesFile(new File(fileFromPath));

		for (String file : allPropertiesFile) {
			String fileNameFromPath = fileFromPath + file;
			String fileNameToPath = fileToPath + file;
			RemovePropertiesFileComment.CreateFile(fileNameToPath);// create
																	// file
			RemovePropertiesFileComment.removeCommentToProperties(fileNameFromPath, fileNameToPath);// remove
																									// comment
			RemovePropertiesFileComment.readFileByLines(fileNameFromPath);// read
																			// the
																			// source
																			// file
			RemovePropertiesFileComment.readFileByLines(fileNameToPath);// read
																		// the
																		// file
																		// without
																		// comment
		}
	}
}